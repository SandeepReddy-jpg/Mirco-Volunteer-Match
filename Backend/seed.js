import "dotenv/config";
import { connect } from "mongoose";
import { usermodel } from "./modules/usermodule.js";
import { taskmodel } from "./modules/task.js";

const demoTasks = [
  { name: "Community garden refresh", description: "Help turn an unused city lot into a beautiful shared garden.", category: ["Environment", "Community"], members: 6 },
  { name: "Digital skills buddy", description: "Pair with a senior neighbour for a friendly hour of digital coaching.", category: ["Education", "Technology"], members: 3 },
  { name: "Food bank packing shift", description: "Sort and pack essential food boxes for local families this weekend.", category: ["Community", "Support"], members: 10 },
];
const demoVolunteers = [
  { name: "Maya Chen", email: "maya.demo@goodturn.local", interest: ["environment", "community"], skills: ["gardening", "organizing"], rating: 4.9 },
  { name: "Arjun Mehta", email: "arjun.demo@goodturn.local", interest: ["education", "technology"], skills: ["teaching", "technology"], rating: 4.8 },
  { name: "Sofia Rivera", email: "sofia.demo@goodturn.local", interest: ["community", "support"], skills: ["food security", "events"], rating: 5 },
];

await connect(process.env.MONGO_URI);
let organizer = await usermodel.findOne({ email: "demo.organizer@goodturn.local" });
if (!organizer) organizer = await usermodel.create({ name: "Goodturn Community", email: "demo.organizer@goodturn.local", password: "goodturn-demo", role: "organizer", interest: ["community", "environment"], skills: ["organizing"] });
for (const volunteer of demoVolunteers) {
  const exists = await usermodel.findOne({ email: volunteer.email });
  if (!exists) await usermodel.create({ ...volunteer, password: "goodturn-demo", role: "volunteer" });
}
const existing = await taskmodel.countDocuments({ postedBy: organizer._id });
if (!existing) await taskmodel.insertMany(demoTasks.map((task) => ({ ...task, postedBy: organizer._id })));
console.log(`Demo tasks ready for ${organizer.email}`);
process.exit(0);
