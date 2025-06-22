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

type Purchase = {
  id: number;
  assetId: number;
  baseId: number;
  quantity: number;
  date: string;
  asset: Asset;
  base: Base;
};

type FilterData = {
  bases: Array<{ id: number; name: string }>;
  equipmentTypes: Array<string>;
  assets: Array<{ id: number; name: string }>;
};

type PurchaseFormData = {
  assetId: string;
  baseId: string;
  quantity: string;
  date: string;
};

type PurchaseFilters = {
  baseId: string;
  equipmentType: string;
  startDate: string;
  endDate: string;
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filterData, setFilterData] = useState<FilterData>();
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState<PurchaseFormData>({
    assetId: "",
    baseId: "default",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [filters, setFilters] = useState<PurchaseFilters>({
    baseId: "1",
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

  const fetchPurchases = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.baseId !== "all") params.append("baseId", filters.baseId);
      if (filters.equipmentType !== "all")
        params.append("equipmentType", filters.equipmentType);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await Fetch(`/purchases?${params.toString()}`);

      if (response && typeof response === "object") {
        if ("purchases" in response) {
          setPurchases(response.purchases as Purchase[]);
        } else if (Array.isArray(response)) {
          setPurchases(response as Purchase[]);
        }
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assetId || !formData.quantity) {
      alert("Asset and quantity are required");
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        assetId: parseInt(formData.assetId),
        baseId:
          formData.baseId !== "default" ? parseInt(formData.baseId) : undefined,
        quantity: parseInt(formData.quantity),
        date: formData.date,
      };

      const response = await Post("/purchases", payload);

      if (response) {
        alert("Purchase created successfully!");
        setFormData({
          assetId: "",
          baseId: "default",
          quantity: "",
          date: new Date().toISOString().split("T")[0],
        });
        fetchPurchases();
      }
    } catch (error) {
      console.error("Error creating purchase:", error);
      alert("Error creating purchase");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleFilterChange = (
    filterType: keyof PurchaseFilters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleFormDataChange = (
    field: keyof PurchaseFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (!filterLoading) {
      fetchPurchases();
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
        <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
        <p className="text-muted-foreground">
          Create new purchases and view purchase history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="base-select">Base</Label>
                <Select
                  value={formData.baseId}
                  onValueChange={(value) =>
                    handleFormDataChange("baseId", value)
                  }
                >
                  <SelectTrigger id="base-select">
                    <SelectValue placeholder="Select a base (optional)" />
                  </SelectTrigger>{" "}
                  <SelectContent>
                    <SelectItem value="default">Default Base</SelectItem>
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
                {formSubmitting ? "Creating..." : "Create Purchase"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-base">Base</Label>
              <Select
                value={filters.baseId}
                onValueChange={(value) => handleFilterChange("baseId", value)}
              >
                <SelectTrigger id="filter-base">
                  <SelectValue placeholder="Select a base" />
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
              <Label htmlFor="filter-equipment">Equipment Type</Label>
              <Select
                value={filters.equipmentType}
                onValueChange={(value) =>
                  handleFilterChange("equipmentType", value)
                }
              >
                <SelectTrigger id="filter-equipment">
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
            <Button onClick={fetchPurchases} disabled={loading}>
              {loading ? "Fetching..." : "Fetch Purchases"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading purchases...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Equipment Type</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No purchases found
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{purchase.id}</TableCell>
                      <TableCell>
                        {purchase.asset?.name || "Unknown Asset"}
                      </TableCell>
                      <TableCell>
                        {purchase.asset?.equipmentType || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {purchase.base?.name || "Unknown Base"}
                      </TableCell>
                      <TableCell>{purchase.quantity}</TableCell>
                      <TableCell>
                        {new Date(purchase.date).toLocaleDateString()}
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
