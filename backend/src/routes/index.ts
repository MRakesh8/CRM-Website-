import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import clientsRouter from "./clients";
import leadsRouter from "./leads";
import projectsRouter from "./projects";
import tasksRouter from "./tasks";
import invoicesRouter from "./invoices";
import paymentsRouter from "./payments";
import ticketsRouter from "./tickets";
import eventsRouter from "./events";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import rolesRouter from "./roles";
import permissionsRouter from "./permissions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(clientsRouter);
router.use(leadsRouter);
router.use(projectsRouter);
router.use(tasksRouter);
router.use(invoicesRouter);
router.use(paymentsRouter);
router.use(ticketsRouter);
router.use(eventsRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(rolesRouter);
router.use(permissionsRouter);

export default router;
