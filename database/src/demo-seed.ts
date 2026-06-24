import { db } from "./index.js";
import { clientsTable } from "./schema/clients.js";
import { projectsTable } from "./schema/projects.js";
import { tasksTable } from "./schema/tasks.js";
import { leadsTable } from "./schema/leads.js";
import { ticketsTable } from "./schema/tickets.js";
import { invoicesTable } from "./schema/invoices.js";
import { usersTable } from "./schema/users.js";

async function run() {
  try {
    console.log("Wiping existing non-user data...");
    await db.delete(invoicesTable);
    await db.delete(ticketsTable);
    await db.delete(tasksTable);
    await db.delete(projectsTable);
    await db.delete(leadsTable);
    await db.delete(clientsTable);

    console.log("Creating highly realistic demo data...");

    const users = await db.select().from(usersTable);
    if (users.length === 0) {
      console.log("No users found. Cannot create demo data.");
      return;
    }
    const adminUser = users[0];

    // 1. Clients
    const clientsData = [
      { name: "Sarah Jenkins", email: "s.jenkins@acmecorp.com", phone: "+1 (415) 555-0198", company: "Acme Corporation", status: "active", createdAt: new Date("2025-10-15T09:00:00Z") },
      { name: "David Chen", email: "david.chen@technovations.io", phone: "+1 (650) 555-0245", company: "TechNova Solutions", status: "active", createdAt: new Date("2026-01-22T14:30:00Z") },
      { name: "Elena Rodriguez", email: "erodriguez@globallogistics.net", phone: "+1 (312) 555-0873", company: "Global Freight & Logistics", status: "active", createdAt: new Date("2026-03-05T11:15:00Z") },
      { name: "Marcus Johnson", email: "mjohnson@starlight.com", phone: "+1 (212) 555-0566", company: "Starlight Entertainment", status: "inactive", createdAt: new Date("2025-08-11T16:45:00Z") },
      { name: "Aisha Patel", email: "aisha.p@healthfirst.org", phone: "+1 (617) 555-0921", company: "HealthFirst Medical", status: "active", createdAt: new Date("2026-04-18T10:20:00Z") },
      { name: "Tom Baker", email: "tbaker@buildrite.com", phone: "+1 (303) 555-0432", company: "BuildRite Construction", status: "active", createdAt: new Date("2026-05-30T08:50:00Z") },
    ];
    const clients = await db.insert(clientsTable).values(clientsData).returning();

    // 2. Leads
    const leadsData = [
      { name: "Robert Fox", email: "rfox@vertex.com", phone: "+1 (415) 555-8832", companyName: "Vertex Analytics", stage: "qualified", value: "125000", assigneeId: adminUser.id, createdAt: new Date("2026-06-10T09:30:00Z") },
      { name: "Jenny Wilson", email: "jwilson@aurora.io", phone: "+1 (650) 555-9921", companyName: "Aurora Tech", stage: "contacted", value: "45000", assigneeId: adminUser.id, createdAt: new Date("2026-06-15T14:00:00Z") },
      { name: "Guy Hawkins", email: "ghawkins@nexus.net", phone: "+1 (212) 555-7745", companyName: "Nexus Systems", stage: "proposal", value: "85000", assigneeId: adminUser.id, createdAt: new Date("2026-06-18T11:45:00Z") },
      { name: "Bessie Cooper", email: "bcooper@pinnacle.org", phone: "+1 (312) 555-6623", companyName: "Pinnacle Health", stage: "new", value: "24000", assigneeId: adminUser.id, createdAt: new Date("2026-06-20T16:15:00Z") },
      { name: "Jerome Bell", email: "jbell@cloudscale.com", phone: "+1 (512) 555-5512", companyName: "CloudScale Inc", stage: "won", value: "150000", assigneeId: adminUser.id, createdAt: new Date("2026-05-05T10:00:00Z") },
      { name: "Kristin Watson", email: "kwatson@creative.design", phone: "+1 (303) 555-4498", companyName: "Creative Minds", stage: "lost", value: "18000", assigneeId: adminUser.id, createdAt: new Date("2026-04-12T13:20:00Z") },
    ];
    await db.insert(leadsTable).values(leadsData);

    // 3. Projects
    const projectsData = [
      { name: "Acme ERP Implementation", description: "Full deployment and integration of the new ERP system across all Acme Corp branches.", status: "active", clientId: clients[0].id, startDate: "2026-01-10", dueDate: "2026-08-15", createdAt: new Date("2026-01-05T09:00:00Z") },
      { name: "TechNova Mobile App", description: "Development of a cross-platform mobile application for customer engagement.", status: "planning", clientId: clients[1].id, startDate: "2026-07-01", dueDate: "2026-12-01", createdAt: new Date("2026-06-01T14:30:00Z") },
      { name: "Global Logistics API", description: "Building a secure API gateway for real-time freight tracking.", status: "active", clientId: clients[2].id, startDate: "2026-04-15", dueDate: "2026-09-30", createdAt: new Date("2026-04-10T11:15:00Z") },
      { name: "Starlight Web Portal", description: "Legacy project: Customer portal for ticketing and events.", status: "on_hold", clientId: clients[3].id, startDate: "2025-09-01", dueDate: "2026-02-28", createdAt: new Date("2025-08-20T16:45:00Z") },
      { name: "HealthFirst Patient Dashboard", description: "HIPAA compliant dashboard for patient records and scheduling.", status: "active", clientId: clients[4].id, startDate: "2026-05-01", dueDate: "2026-10-31", createdAt: new Date("2026-04-25T10:20:00Z") },
      { name: "BuildRite Resource Planner", description: "Completed internal tool for managing construction equipment and crew schedules.", status: "completed", clientId: clients[5].id, startDate: "2026-02-01", dueDate: "2026-05-15", createdAt: new Date("2026-01-20T08:50:00Z") },
    ];
    const projects = await db.insert(projectsTable).values(projectsData).returning();

    // 4. Tasks
    const tasksData = [
      { title: "Finalize API Documentation", description: "Draft and review the Swagger documentation for the tracking endpoints.", status: "in_progress", priority: "high", projectId: projects[2].id, assigneeId: adminUser.id, dueDate: "2026-06-30", createdAt: new Date("2026-06-20T09:00:00Z") },
      { title: "Database Schema Review", description: "Review the proposed schema for the patient dashboard to ensure compliance.", status: "todo", priority: "urgent", projectId: projects[4].id, assigneeId: adminUser.id, dueDate: "2026-06-26", createdAt: new Date("2026-06-22T14:30:00Z") },
      { title: "Setup CI/CD Pipeline", description: "Configure GitHub Actions for automated testing and deployment of the mobile app.", status: "todo", priority: "medium", projectId: projects[1].id, assigneeId: adminUser.id, dueDate: "2026-07-05", createdAt: new Date("2026-06-23T11:15:00Z") },
      { title: "Conduct User Training", description: "Run training sessions for the Acme Corp management team on the new ERP.", status: "todo", priority: "medium", projectId: projects[0].id, assigneeId: adminUser.id, dueDate: "2026-07-15", createdAt: new Date("2026-06-24T16:45:00Z") },
      { title: "Security Audit Findings", description: "Address the vulnerabilities found during the Q2 security audit.", status: "in_progress", priority: "urgent", projectId: projects[0].id, assigneeId: adminUser.id, dueDate: "2026-06-28", createdAt: new Date("2026-06-18T10:20:00Z") },
      { title: "Project Handoff Meeting", description: "Final meeting to hand over the resource planner to the BuildRite team.", status: "done", priority: "low", projectId: projects[5].id, assigneeId: adminUser.id, dueDate: "2026-05-20", createdAt: new Date("2026-05-18T08:50:00Z") },
    ];
    await db.insert(tasksTable).values(tasksData);

    // 5. Tickets
    const ticketsData = [
      { ticketNumber: "TCK-1001", subject: "Unable to login to ERP portal", description: "User reports getting a 401 error when trying to access the production environment.", status: "open", priority: "high", clientId: clients[0].id, assigneeId: adminUser.id, createdAt: new Date("2026-06-24T08:15:00Z") },
      { ticketNumber: "TCK-1002", subject: "Feature Request: Export to CSV", description: "Can we add an option to export the freight tracking history to a CSV file?", status: "in_progress", priority: "low", clientId: clients[2].id, assigneeId: adminUser.id, createdAt: new Date("2026-06-22T14:20:00Z") },
      { ticketNumber: "TCK-1003", subject: "Server timeout on patient search", description: "The patient search endpoint is occasionally timing out during peak hours.", status: "waiting", priority: "urgent", clientId: clients[4].id, assigneeId: adminUser.id, createdAt: new Date("2026-06-23T09:45:00Z") },
      { ticketNumber: "TCK-1004", subject: "Update billing address", description: "Please update our corporate billing address for future invoices.", status: "resolved", priority: "normal", clientId: clients[1].id, assigneeId: adminUser.id, createdAt: new Date("2026-06-20T11:30:00Z") },
      { ticketNumber: "TCK-1005", subject: "Starlight portal down", description: "The legacy portal is currently returning a 502 Bad Gateway error.", status: "open", priority: "urgent", clientId: clients[3].id, assigneeId: adminUser.id, createdAt: new Date("2026-06-24T10:05:00Z") },
      { ticketNumber: "TCK-1006", subject: "Password reset assistance", description: "A new contractor needs help resetting their account password.", status: "closed", priority: "normal", clientId: clients[5].id, assigneeId: adminUser.id, createdAt: new Date("2026-06-18T16:50:00Z") },
    ];
    await db.insert(ticketsTable).values(ticketsData);

    // 6. Invoices
    const invoicesData = [
      { invoiceNumber: "INV-2026-042", clientId: clients[0].id, projectId: projects[0].id, amount: 2500000, items: [{ description: "ERP Implementation Milestone 2", quantity: 1, unitPrice: 25000, amount: 25000 }], subtotal: "25000.00", total: "25000.00", status: "paid", issueDate: "2026-05-01", dueDate: "2026-05-31", createdAt: new Date("2026-05-01T09:00:00Z") },
      { invoiceNumber: "INV-2026-056", clientId: clients[2].id, projectId: projects[2].id, amount: 1500000, items: [{ description: "API Development Sprint 3", quantity: 1, unitPrice: 15000, amount: 15000 }], subtotal: "15000.00", total: "15000.00", status: "sent", issueDate: "2026-06-15", dueDate: "2026-07-15", createdAt: new Date("2026-06-15T10:30:00Z") },
      { invoiceNumber: "INV-2026-061", clientId: clients[4].id, projectId: projects[4].id, amount: 850000, items: [{ description: "Dashboard UI/UX Design", quantity: 1, unitPrice: 8500, amount: 8500 }], subtotal: "8500.00", total: "8500.00", status: "draft", issueDate: "2026-06-25", dueDate: "2026-07-25", createdAt: new Date("2026-06-24T14:15:00Z") },
      { invoiceNumber: "INV-2026-038", clientId: clients[5].id, projectId: projects[5].id, amount: 1200000, items: [{ description: "Final Project Handover & Support", quantity: 1, unitPrice: 12000, amount: 12000 }], subtotal: "12000.00", total: "12000.00", status: "overdue", issueDate: "2026-04-10", dueDate: "2026-05-10", createdAt: new Date("2026-04-10T11:20:00Z") },
      { invoiceNumber: "INV-2026-021", clientId: clients[3].id, projectId: projects[3].id, amount: 500000, items: [{ description: "Monthly Server Maintenance", quantity: 1, unitPrice: 5000, amount: 5000 }], subtotal: "5000.00", total: "5000.00", status: "cancelled", issueDate: "2026-02-01", dueDate: "2026-03-01", createdAt: new Date("2026-02-01T08:45:00Z") },
      { invoiceNumber: "INV-2026-065", clientId: clients[1].id, projectId: projects[1].id, amount: 1800000, items: [{ description: "Mobile App Discovery Phase", quantity: 1, unitPrice: 18000, amount: 18000 }], subtotal: "18000.00", total: "18000.00", status: "draft", issueDate: "2026-07-01", dueDate: "2026-07-31", createdAt: new Date("2026-06-20T16:30:00Z") },
    ];
    await db.insert(invoicesTable).values(invoicesData);

    console.log("Highly realistic demo data created successfully!");
  } catch (error) {
    console.error("Error creating demo data:", error);
  } finally {
    process.exit(0);
  }
}

run();
