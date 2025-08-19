import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import readline from "readline";

const prisma = new PrismaClient();

interface BlockInfo {
  block_code: string;
  block_name: string;
  district_name: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim()); // Add the last field
  return result;
}

async function extractBlocks(csvPath: string) {
  console.log("Extracting blocks from CSV...");
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  const seen = new Set<string>();
  const blocks: BlockInfo[] = [];
  let isHeader = true;
  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }
    const cols = line.split(",");
    if (cols.length < 4) continue;
    let district = (cols[1] ?? "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .toUpperCase();
    let block_code = (cols[2] ?? "").trim();
    let block_name = (cols[3] ?? "").trim().replace(/\s+/g, " ");
    const key = `${block_code}|${block_name}|${district}`;
    if (!seen.has(key)) {
      seen.add(key);
      blocks.push({ block_code, block_name, district_name: district });
    }
  }

  // Ensure all block codes referenced in school_list.csv are present
  const schoolStream = fs.createReadStream(csvPath);
  const schoolRl = readline.createInterface({
    input: schoolStream,
    crlfDelay: Infinity,
  });
  let isSchoolHeader = true;
  for await (const line of schoolRl) {
    if (isSchoolHeader) {
      isSchoolHeader = false;
      continue;
    }
    const cols = line.split(",");
    if (cols.length < 4) continue;
    let district = (cols[1] ?? "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .toUpperCase();
    let block_code = (cols[2] ?? "").trim();
    let block_name = (cols[3] ?? "").trim().replace(/\s+/g, " ");
    const key = `${block_code}|${block_name}|${district}`;
    if (!seen.has(key)) {
      seen.add(key);
      blocks.push({ block_code, block_name, district_name: district });
    }
  }

  // Insert blocks into DB
  for (const b of blocks) {
    try {
      await prisma.block.upsert({
        where: { code: Number(b.block_code) },
        update: {
          name: b.block_name,
          district: b.district_name as any,
        },
        create: {
          code: Number(b.block_code),
          name: b.block_name,
          district: b.district_name as any,
          phone: "",
          password: "",
        },
      });
    } catch (err) {
      console.error(`Error inserting block ${b.block_code}:`, err);
    }
  }
  console.log("Block data import complete.");
}

async function main() {
  console.log("Starting to seed the database...");

  // Read the CSV file
  const csvPath = path.join(__dirname, "..", "school_list.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  // Parse CSV content
  const lines = csvContent.trim().split("\n");

  console.log(`Found ${lines.length - 1} schools to import...`);

  // Clear existing data
  console.log("Clearing existing school data...");

  // Extract Blocks
  extractBlocks(csvPath);

  await prisma.school.deleteMany();

  // Process each line (skip header)
  const schools: {
    district_code: number;
    district: string;
    block_code: number;
    block_name: string;
    udise: bigint;
    name: string;
    management: string;
    category: string;
    type: string;
  }[] = [];

  let successCount = 0;
  let errorCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      console.log(`Skipping empty line ${i}`);
      continue;
    }

    try {
      // Use proper CSV parsing to handle commas in quoted fields
      const values = parseCSVLine(line);

      if (values.length < 9) {
        console.log(
          `Skipping malformed line ${i} (only ${
            values.length
          } fields): ${line.substring(0, 100)}...`
        );
        errorCount++;
        continue;
      }

      // Validate required numeric fields
      const districtCode = parseInt(values[0]);
      const blockCode = parseInt(values[2]);
      const udiseStr = values[4];

      if (isNaN(districtCode) || isNaN(blockCode) || !udiseStr) {
        console.log(
          `Skipping line ${i} due to invalid numeric data: district_code=${values[0]}, block_code=${values[2]}, udise=${values[4]}`
        );
        errorCount++;
        continue;
      }

      // Parse the data according to the CSV structure
      const school = {
        district_code: districtCode,
        district: (values[1] || "").replace(/"/g, "").trim(),
        block_code: blockCode,
        block_name: (values[3] || "").replace(/"/g, "").trim(),
        udise: BigInt(udiseStr),
        name: (values[5] || "").replace(/"/g, "").trim(),
        management: (values[6] || "").replace(/"/g, "").trim(),
        category: (values[7] || "").replace(/"/g, "").trim(),
        type: (values[8] || "").replace(/"/g, "").trim(),
      };

      schools.push(school);
      successCount++;

      // Insert in batches of 100 to avoid memory issues
      if (schools.length === 100) {
        await prisma.school.createMany({
          data: schools,
          skipDuplicates: true,
        });
        console.log(
          `Inserted batch ${Math.ceil(
            successCount / 100
          )}, ${successCount} schools processed successfully...`
        );
        schools.length = 0; // Clear array
      }
    } catch (error: any) {
      errorCount++;
      console.log(`Error processing line ${i}: ${error.message}`);
      console.log(`Line content: ${line.substring(0, 150)}...`);

      // Don't fail the entire process for one bad line
      continue;
    }
  }

  // Insert remaining schools
  if (schools.length > 0) {
    await prisma.school.createMany({
      data: schools,
      skipDuplicates: true,
    });
    console.log(`Inserted final batch of ${schools.length} schools`);
  }

  console.log("Database seeding completed!");
  console.log(`Successfully processed: ${successCount} schools`);
  console.log(`Errors encountered: ${errorCount} lines`);

  // Display final count
  const totalSchools = await prisma.school.count();
  console.log(`Total schools in database: ${totalSchools}`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
