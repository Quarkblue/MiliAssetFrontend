import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import { Fetch } from "../lib/api";
import { toast } from "sonner";

type DashboardData = {
  openingBalance: number;
  closingBalance: number;
  netMovement: {
    purchases: number;
    transferIn: number;
    transferOut: number;
  };
  assigned: number;
  expended: number;
};

type FilterData = {
  bases: Array<{ id: number; name: string }>;
  equipmentTypes: Array<string>;
  assets: Array<{ id: number; name: string }>;
  personnel: Array<{ id: number; name: string }>;
};

type Filters = {
  base: string;
  equipmentType: string;
  dateRange: string;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>();
  const [filterData, setFilterData] = useState<FilterData>();
  const [filters, setFilters] = useState<Filters>({
    base: "1",
    equipmentType: "all",
    dateRange: "2025-06-01=2025-06-30",
  });
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(true);
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setFilterLoading(true);
        const response = await Fetch(
          "/filter-data?filters=bases,equipmentTypes"
        );

        if (response && typeof response === "object") {
          if ("data" in response && response.data) {
            setFilterData(response.data as FilterData);
          } else if ("bases" in response || "equipmentTypes" in response) {
            setFilterData(response as FilterData);
          }
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filters.base !== "all") {
        params.append("baseId", filters.base);
      } else {
        console.warn("No base selected - API requires baseId");
        return;
      }

      if (filters.equipmentType !== "all") {
        params.append("equipmentType", filters.equipmentType);
      }

      if (filters.dateRange !== "all") {
        const [startDate, endDate] = filters.dateRange.split("=");
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      } else {
        console.warn(
          "No date range selected - API requires startDate and endDate"
        );
        return;
      }
      const response = await Fetch<DashboardData>(
        `/dashboard?${params.toString()}`
      );

      if (response && typeof response === "object") {
        if ("data" in response && response.data) {
          setData(response.data as DashboardData);
        } else {
          setData(response as DashboardData);
        }
      }
    } catch (error) {
      toast("Error fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleFetchData = () => {
    fetchDashboardData();
  };
  const canFetchData = () => {
    return filters.base !== "all" && filters.dateRange !== "all";
  };
  useEffect(() => {
    if (!filterLoading && canFetchData()) {
      fetchDashboardData();
    }
  }, [filterLoading]);

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial data and metrics
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-select">Base</Label>
                <Select
                  value={filters.base}
                  onValueChange={(value) => handleFilterChange("base", value)}
                >
                  <SelectTrigger id="base-select">
                    <SelectValue placeholder="Select a base" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bases</SelectItem>
                    {filterData?.bases
                      ?.filter((base) => base && base.id != null)
                      .map((base) => (
                        <SelectItem key={base.id} value={base.id.toString()}>
                          {base.name || "Unknown Base"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment-select">Equipment Type</Label>
                <Select
                  value={filters.equipmentType}
                  onValueChange={(value) =>
                    handleFilterChange("equipmentType", value)
                  }
                >
                  <SelectTrigger id="equipment-select">
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Equipment Types</SelectItem>
                    {filterData?.equipmentTypes?.map((equipment, index) => (
                      <SelectItem key={equipment || index} value={equipment}>
                        {equipment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-select">Date Range</Label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) =>
                    handleFilterChange("dateRange", value)
                  }
                >
                  <SelectTrigger id="date-select">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="2025-01-01=2025-01-31">
                      January 2025
                    </SelectItem>
                    <SelectItem value="2025-02-01=2025-02-28">
                      February 2025
                    </SelectItem>
                    <SelectItem value="2025-03-01=2025-03-31">
                      March 2025
                    </SelectItem>
                    <SelectItem value="2025-04-01=2025-04-30">
                      April 2025
                    </SelectItem>
                    <SelectItem value="2025-05-01=2025-05-31">
                      May 2025
                    </SelectItem>
                    <SelectItem value="2025-06-01=2025-06-30">
                      June 2025
                    </SelectItem>
                    <SelectItem value="2025-07-01=2025-07-31">
                      July 2025
                    </SelectItem>
                    <SelectItem value="2025-08-01=2025-08-31">
                      August 2025
                    </SelectItem>
                    <SelectItem value="2025-09-01=2025-09-30">
                      September 2025
                    </SelectItem>
                    <SelectItem value="2025-10-01=2025-10-31">
                      October 2025
                    </SelectItem>
                    <SelectItem value="2025-11-01=2025-11-30">
                      November 2025
                    </SelectItem>
                    <SelectItem value="2025-12-01=2025-12-31">
                      December 2025
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleFetchData}
                disabled={!canFetchData() || loading}
                className="min-w-[120px]"
              >
                {loading ? "Fetching..." : "Fetch Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <p>Loading dashboard data...</p>
          </div>
        )}
      </div>
    );
  }

  if (filterLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading filters...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial data and metrics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="base-select">Base</Label>
              <Select
                value={filters.base}
                onValueChange={(value) => handleFilterChange("base", value)}
              >
                <SelectTrigger id="base-select">
                  <SelectValue placeholder="Select a base" />
                </SelectTrigger>{" "}
                <SelectContent>
                  <SelectItem value="all">All Bases</SelectItem>
                  {filterData?.bases
                    ?.filter((base) => base && base.id != null)
                    .map((base) => (
                      <SelectItem key={base.id} value={base.id.toString()}>
                        {base.name || "Unknown Base"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="equipment-select">Equipment Type</Label>
              <Select
                value={filters.equipmentType}
                onValueChange={(value) =>
                  handleFilterChange("equipmentType", value)
                }
              >
                <SelectTrigger id="equipment-select">
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>{" "}
                <SelectContent>
                  <SelectItem value="all">All Equipment Types</SelectItem>
                  {filterData?.equipmentTypes?.map((equipment, index) => (
                    <SelectItem key={equipment || index} value={equipment}>
                      {equipment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date-select">Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  handleFilterChange("dateRange", value)
                }
              >
                <SelectTrigger id="date-select">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>{" "}
                <SelectContent>
                  <SelectItem value="2025-01-01=2025-01-31">
                    January 2025
                  </SelectItem>
                  <SelectItem value="2025-02-01=2025-02-28">
                    February 2025
                  </SelectItem>
                  <SelectItem value="2025-03-01=2025-03-31">
                    March 2025
                  </SelectItem>
                  <SelectItem value="2025-04-01=2025-04-30">
                    April 2025
                  </SelectItem>
                  <SelectItem value="2025-05-01=2025-05-31">
                    May 2025
                  </SelectItem>
                  <SelectItem value="2025-06-01=2025-06-30">
                    June 2025
                  </SelectItem>
                  <SelectItem value="2025-07-01=2025-07-31">
                    July 2025
                  </SelectItem>
                  <SelectItem value="2025-08-01=2025-08-31">
                    August 2025
                  </SelectItem>
                  <SelectItem value="2025-09-01=2025-09-30">
                    September 2025
                  </SelectItem>
                  <SelectItem value="2025-10-01=2025-10-31">
                    October 2025
                  </SelectItem>
                  <SelectItem value="2025-11-01=2025-11-30">
                    November 2025
                  </SelectItem>
                  <SelectItem value="2025-12-01=2025-12-31">
                    December 2025
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleFetchData}
              disabled={!canFetchData() || loading}
              className="min-w-[120px]"
            >
              {loading ? "Fetching..." : "Fetch Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {" "}
              <TableRow>
                <TableCell>Opening Balance</TableCell>
                <TableCell>{data?.openingBalance || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Purchases</TableCell>
                <TableCell>{data?.netMovement?.purchases || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Transfer In</TableCell>
                <TableCell>{data?.netMovement?.transferIn || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Transfer Out</TableCell>
                <TableCell>{data?.netMovement?.transferOut || 0}</TableCell>
              </TableRow>{" "}
              <TableRow>
                <TableCell>Assigned</TableCell>
                <TableCell>{data?.assigned || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Expended</TableCell>
                <TableCell>{data?.expended || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Closing Balance</TableCell>
                <TableCell className="font-semibold">
                  {data?.closingBalance || 0}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
