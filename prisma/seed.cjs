/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const devices = [
    // Lighting
    { slug: "smart-dimmer", name: "Smart Dimmer Switch", category: "Lighting", unit: "piece", price: 45, install: 15 },
    { slug: "smart-bulb", name: "Smart LED Bulb (RGB)", category: "Lighting", unit: "piece", price: 12, install: 3 },
    { slug: "motion-sensor", name: "PIR Motion Sensor", category: "Sensors", unit: "piece", price: 18, install: 6 },
    { slug: "door-sensor", name: "Door/Window Contact", category: "Sensors", unit: "piece", price: 12, install: 4 },
    { slug: "thermo-sensor", name: "Temperature/Humidity Sensor", category: "Sensors", unit: "piece", price: 19, install: 5 },
    // Security
    { slug: "indoor-cam", name: "Indoor Wi‑Fi Camera", category: "Security", unit: "piece", price: 39, install: 10 },
    { slug: "outdoor-cam", name: "Outdoor IP66 Camera", category: "Security", unit: "piece", price: 69, install: 15 },
    { slug: "door-lock", name: "Smart Door Lock", category: "Security", unit: "piece", price: 149, install: 35 },
    { slug: "siren", name: "Siren/Alarm Kit", category: "Security", unit: "piece", price: 59, install: 12 },
    // Climate
    { slug: "smart-thermostat", name: "Smart Thermostat", category: "Climate", unit: "piece", price: 129, install: 25 },
    // Media
    { slug: "ir-blaster", name: "Smart IR Blaster", category: "Media", unit: "piece", price: 25, install: 8 },
    // Network
    { slug: "hub", name: "Automation Hub/Gateway", category: "Hub", unit: "piece", price: 89, install: 20 }
  ];

  for (const d of devices) {
    await prisma.device.upsert({
      where: { slug: d.slug },
      update: {},
      create: d,
    });
  }

  console.log("Seeded devices:", devices.length);
}

main().finally(async () => {
  await prisma.$disconnect();
});
