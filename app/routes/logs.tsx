import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import { Fetch } from "../lib/api";

type Log = {
  id: number;
  userId: number;
  action: string;
  details: string;
  timestamp: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await Fetch("/logs");
      
      if (response && typeof response === 'object') {
        if ('logs' in response) {
          setLogs(response.logs as Log[]);
        } else if (Array.isArray(response)) {
          setLogs(response as Log[]);
        }
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      if (error instanceof Error && error.message.includes('403')) {
        alert("Access denied. Only administrators can view logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground">
          View system activity logs and user actions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button onClick={fetchLogs} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh Logs"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading logs...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell>
                        <span className="font-medium">{log.action}</span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={log.details}>
                          {log.details}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
