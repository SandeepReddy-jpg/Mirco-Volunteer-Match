import "dotenv/config";
import { connect } from "mongoose";
import { usermodel } from "./modules/usermodule.js";
import { taskmodel } from "./modules/task.js";

const demoTasks = [
  { name: "Community garden refresh", description: "Help turn an unused city lot into a beautiful shared garden with herbs, raised vegetable beds, and shaded benches.", category: ["Environment", "Community"], members: 6 },
  { name: "Digital skills buddy", description: "Pair with a senior neighbour for a friendly hour of digital coaching on smartphones, email, and video calls.", category: ["Education", "Community"], members: 3 },
  { name: "Food bank packing shift", description: "Sort fresh market produce and pack essential grocery hampers for local families and shelters this weekend.", category: ["Community"], members: 10 },
  { name: "Neighbourhood mural day", description: "Bring vibrant colour to a shared public wall alongside local street artists, young painters, and friendly neighbours.", category: ["Community", "Environment"], members: 8 },
  { name: "River clean-up & trail walk", description: "Collect shoreline litter, catalogue recyclable plastics, and protect native bird nesting habitats along the river.", category: ["Environment"], members: 12 },
  { name: "Homework club helper", description: "Make learning, math problems, and reading fun and approachable for elementary school students after school.", category: ["Education"], members: 5 },
  { name: "Warm meals delivery", description: "Deliver freshly prepared, nutritious warm lunches to homebound elderly residents and community members.", category: ["Community"], members: 7 },
  { name: "Seed swap & plant start", description: "Exchange heirloom seeds, share organic potting tips, and prepare seed starter trays for local school gardens.", category: ["Environment", "Community"], members: 4 },
  { name: "Resume review & career circle", description: "Provide constructive feedback, LinkedIn polish, and encouraging practice interviews for youth entering the workforce.", category: ["Education", "Community"], members: 4 },
  { name: "Urban tree care & sapling planting", description: "Aerate soil beds, spread natural mulch, and install protective guards around newly planted urban street saplings.", category: ["Environment"], members: 8 },
  { name: "Youth STEM & coding mentor", description: "Introduce eager middle-school students to basic creative coding, interactive robotics, and problem solving.", category: ["Education"], members: 4 },
  { name: "Community bicycle clinic", description: "Help neighbours inspect tire pressure, adjust loose chains, replace brake pads, and share safe cycling habits.", category: ["Community"], members: 6 },
];
const demoVolunteers = [
  { name: "Maya Chen", email: "maya.demo@goodturn.local", interest: ["environment", "community"], skills: ["gardening", "organizing"], rating: 4.9 },
  { name: "Arjun Mehta", email: "arjun.demo@goodturn.local", interest: ["education", "technology"], skills: ["teaching", "technology"], rating: 4.8 },
  { name: "Sofia Rivera", email: "sofia.demo@goodturn.local", interest: ["community", "support"], skills: ["food security", "events"], rating: 5 },
];

const DEMO_PASSWORD = "goodturn-demo";

/**
 * Idempotent demo-data provisioning. Upserts the demo organizer + volunteers
 * if missing and inserts the demo task list once per organizer. Safe to run on
 * every server boot.
 */
export async function seedDemoData() {
  let organizer = await usermodel.findOne({ email: "demo.organizer@goodturn.local" });
  if (!organizer) {
    organizer = await usermodel.create({
      name: "Goodturn Community",
      email: "demo.organizer@goodturn.local",
      password: DEMO_PASSWORD,
      role: "organizer",
      interest: ["community", "environment"],
      skills: ["organizing"],
    });
  }

  let createdVolunteers = 0;
  for (const volunteer of demoVolunteers) {
    const exists = await usermodel.findOne({ email: volunteer.email });
    if (exists) continue;
    await usermodel.create({ ...volunteer, password: DEMO_PASSWORD, role: "volunteer" });
    createdVolunteers += 1;
  }

  let insertedTasks = 0;
  const existing = await taskmodel.countDocuments({ postedBy: organizer._id });
  if (!existing) {
    await taskmodel.insertMany(demoTasks.map((task) => ({ ...task, postedBy: organizer._id })));
    insertedTasks = demoTasks.length;
  }

  return {
    organizerEmail: organizer.email,
    volunteers: demoVolunteers.length,
    createdVolunteers,
    tasks: insertedTasks || existing,
  };
}

// `node seed.js` — keep the standalone CLI working too.
import { fileURLToPath } from "url";
const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url).replace(/\\/g, "/") === process.argv[1].replace(/\\/g, "/");

if (isDirectRun) {
  await connect(process.env.MONGO_URI);
  const summary = await seedDemoData();
  console.log(`Demo data ready — organizer: ${summary.organizerEmail}`);
  console.log(`  volunteers: ${summary.volunteers} (${summary.createdVolunteers} newly created)`);
  console.log(`  tasks: ${summary.tasks}`);
  process.exit(0);
}