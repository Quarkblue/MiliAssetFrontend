import { type RouteConfig, route, index, layout } from "@react-router/dev/routes";

export default [
    route("login", "routes/login.tsx"),
    layout("routes/_layout.tsx", [
        index("routes/dashboard.tsx"),
        route("purchases", "routes/purchases.tsx"),
        route("transfer", "routes/transfer.tsx"),
        route("logs", "routes/logs.tsx"),
    ]),

] satisfies RouteConfig;
