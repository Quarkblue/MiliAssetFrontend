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
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import { Fetch, Post } from "../lib/api";

type Asset = {
  id: number;
  name: string;
  equipmentType: string;
};

type Base = {
  id: number;
  name: string;
};

type Transfer = {
  id: number;
  assetId: number;
  fromBaseId: number;
  toBaseId: number;
  quantity: number;
  date: string;
  asset: Asset;
  fromBase: Base;
  toBase: Base;
};

type FilterData = {
  bases: Array<{ id: number; name: string }>;
  equipmentTypes: Array<string>;
  assets: Array<{ id: number; name: string }>;
};

type TransferFormData = {
  assetId: string;
  fromBaseId: string;
  toBaseId: string;
  quantity: string;
  date: string;
};

type TransferFilters = {
  fromBaseId: string;
  toBaseId: string;
  assetId: string;
  equipmentType: string;
  startDate: string;
  endDate: string;
};

export default function TransferPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filterData, setFilterData] = useState<FilterData>();
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [formData, setFormData] = useState<TransferFormData>({
    assetId: "",
    fromBaseId: "",
    toBaseId: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [filters, setFilters] = useState<TransferFilters>({
    fromBaseId: "all",
    toBaseId: "all",
    assetId: "all",
    equipmentType: "all",
    startDate: "2025-06-01",
    endDate: "2025-06-30",
  });

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setFilterLoading(true);
        const response = await Fetch(
          "/filter-data?filters=bases,equipmentTypes,assets"
        );

        if (response && typeof response === "object") {
          if ("data" in response && response.data) {
            setFilterData(response.data as FilterData);
          } else if (
            "bases" in response ||
            "equipmentTypes" in response ||
            "assets" in response
          ) {
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

  const fetchTransfers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.fromBaseId !== "all")
        params.append("fromBaseId", filters.fromBaseId);
      if (filters.toBaseId !== "all")
        params.append("toBaseId", filters.toBaseId);
      if (filters.assetId !== "all") params.append("assetId", filters.assetId);
      if (filters.equipmentType !== "all")
        params.append("equipmentType", filters.equipmentType);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await Fetch(`/transfers?${params.toString()}`);

      if (response && typeof response === "object") {
        if ("transfers" in response) {
          setTransfers(response.transfers as Transfer[]);
        } else if (Array.isArray(response)) {
          setTransfers(response as Transfer[]);
        }
      }
    } catch (error) {
      console.error("Error fetching transfers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.assetId ||
      !formData.fromBaseId ||
      !formData.toBaseId ||
      !formData.quantity
    ) {
      alert("Asset, From Base, To Base, and Quantity are required");
      return;
    }

    if (formData.fromBaseId === formData.toBaseId) {
      alert("From Base and To Base cannot be the same");
      return;
    }
    try {
      setFormSubmitting(true);

      const payload = {
        assetId: parseInt(formData.assetId),
        fromBaseId: parseInt(formData.fromBaseId),
        toBaseId: parseInt(formData.toBaseId),
        quantity: parseInt(formData.quantity),
        date: formData.date,
      };

      const response = await Post("/transfers", payload);

      if (response) {
        alert("Transfer created successfully!");
        setFormData({
          assetId: "",
          fromBaseId: "",
          toBaseId: "",
          quantity: "",
          date: new Date().toISOString().split("T")[0],
        });
        fetchTransfers();
      }
    } catch (error) {
      console.error("Error creating transfer:", error);
      alert("Error creating transfer");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleFilterChange = (
    filterType: keyof TransferFilters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleFormDataChange = (
    field: keyof TransferFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (!filterLoading) {
      fetchTransfers();
    }
  }, [filterLoading]);

  if (filterLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Asset Transfers</h1>
        <p className="text-muted-foreground">
          Transfer assets between bases and view transfer history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Transfer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asset-select">Asset *</Label>
                <Select
                  value={formData.assetId}
                  onValueChange={(value) =>
                    handleFormDataChange("assetId", value)
                  }
                >
                  <SelectTrigger id="asset-select">
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterData?.assets?.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id.toString()}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-base-select">From Base *</Label>
                <Select
                  value={formData.fromBaseId}
                  onValueChange={(value) =>
                    handleFormDataChange("fromBaseId", value)
                  }
                >
                  <SelectTrigger id="from-base-select">
                    <SelectValue placeholder="Select source base" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterData?.bases?.map((base) => (
                      <SelectItem key={base.id} value={base.id.toString()}>
                        {base.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-base-select">To Base *</Label>
                <Select
                  value={formData.toBaseId}
                  onValueChange={(value) =>
                    handleFormDataChange("toBaseId", value)
                  }
                >
                  <SelectTrigger id="to-base-select">
                    <SelectValue placeholder="Select destination base" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterData?.bases?.map((base) => (
                      <SelectItem key={base.id} value={base.id.toString()}>
                        {base.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleFormDataChange("quantity", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormDataChange("date", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? "Creating Transfer..." : "Create Transfer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transfer History Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-from-base">From Base</Label>
              <Select
                value={filters.fromBaseId}
                onValueChange={(value) =>
                  handleFilterChange("fromBaseId", value)
                }
              >
                <SelectTrigger id="filter-from-base">
                  <SelectValue placeholder="Any base" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bases</SelectItem>
                  {filterData?.bases?.map((base) => (
                    <SelectItem key={base.id} value={base.id.toString()}>
                      {base.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-to-base">To Base</Label>
              <Select
                value={filters.toBaseId}
                onValueChange={(value) => handleFilterChange("toBaseId", value)}
              >
                <SelectTrigger id="filter-to-base">
                  <SelectValue placeholder="Any base" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bases</SelectItem>
                  {filterData?.bases?.map((base) => (
                    <SelectItem key={base.id} value={base.id.toString()}>
                      {base.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-asset">Asset</Label>
              <Select
                value={filters.assetId}
                onValueChange={(value) => handleFilterChange("assetId", value)}
              >
                <SelectTrigger id="filter-asset">
                  <SelectValue placeholder="Any asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {filterData?.assets?.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id.toString()}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-equipment">Equipment Type</Label>
              <Select
                value={filters.equipmentType}
                onValueChange={(value) =>
                  handleFilterChange("equipmentType", value)
                }
              >
                <SelectTrigger id="filter-equipment">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {filterData?.equipmentTypes?.map((equipment, index) => (
                    <SelectItem key={equipment || index} value={equipment}>
                      {equipment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={fetchTransfers} disabled={loading}>
              {loading ? "Fetching..." : "Fetch Transfers"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading transfers...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Equipment Type</TableHead>
                  <TableHead>From Base</TableHead>
                  <TableHead>To Base</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No transfers found
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{transfer.id}</TableCell>
                      <TableCell>
                        {transfer.asset?.name || "Unknown Asset"}
                      </TableCell>
                      <TableCell>
                        {transfer.asset?.equipmentType || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {transfer.fromBase?.name || "Unknown Base"}
                      </TableCell>
                      <TableCell>
                        {transfer.toBase?.name || "Unknown Base"}
                      </TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>
                        {new Date(transfer.date).toLocaleDateString()}
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
