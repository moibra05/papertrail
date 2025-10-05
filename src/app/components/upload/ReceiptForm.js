import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save } from "lucide-react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORIES = [
  "food_dining",
  "groceries",
  "transportation",
  "utilities",
  "healthcare",
  "entertainment",
  "shopping",
  "travel",
  "business_services",
  "office_supplies",
  "software_subscriptions",
  "other",
];

const PAYMENT_METHODS = [
  "credit_card",
  "debit_card",
  "cash",
  "bank_transfer",
  "digital_wallet",
  "other",
];

export default function ReceiptForm({ extractedData, onSave, onCancel }) {
  const [formData, setFormData] = React.useState({
    merchant: extractedData?.merchant || "",
    purchase_date: extractedData?.purchase_date || "",
    total_amount: extractedData?.total_amount || 0,
    category: extractedData?.category || "other",
    payment_method: extractedData?.payment_method || "",
    receipt_number: extractedData?.receipt_number || "",
    tax_amount: extractedData?.tax_amount || 0,
    items: extractedData?.items || [],
    notes: extractedData?.notes || "",
    tags: extractedData?.tags || [],
    folder_id: extractedData?.folder_id || "",
  });
  const [folders, setFolders] = React.useState([]);
  const [newTag, setNewTag] = React.useState("");

  React.useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    const data = await Folder.list("-created_date");
    setFolders(data);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unit_price") {
      newItems[index].total =
        (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
    }
    handleChange("items", newItems);
  };

  const addItem = () => {
    handleChange("items", [
      ...formData.items,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    handleChange(
      "items",
      formData.items.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    handleChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0 bg-surface backdrop-blur-sm shadow-xl">
        <CardHeader className="border-b ">
          <CardTitle className="text-2xl font-bold text-foreground">Review & Edit Receipt</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant *</Label>
                <Input
                id="merchant"
                value={formData.merchant}
                onChange={(e) => handleChange("merchant", e.target.value)}
                placeholder="Store or business name"
                className=""
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleChange('purchase_date', e.target.value)}
                className="border-subtle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount *</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => handleChange('total_amount', parseFloat(e.target.value))}
                className=""
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_amount">Tax Amount</Label>
              <Input
                id="tax_amount"
                type="number"
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => handleChange('tax_amount', parseFloat(e.target.value))}
                className=""
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger className=" bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleChange('payment_method', value)}>
                <SelectTrigger className=" bg-surface">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder">Folder (Optional)</Label>
              <Select value={formData.folder_id} onValueChange={(value) => handleChange('folder_id', value)}>
                <SelectTrigger className=" bg-surface">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No Folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: folder.color }}
                        />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_number">Receipt Number</Label>
              <Input
                id="receipt_number"
                value={formData.receipt_number}
                onChange={(e) => handleChange("receipt_number", e.target.value)}
                placeholder="Transaction or receipt ID"
                className=""
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>
            {formData.items.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface">
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-28">Price</TableHead>
                      <TableHead className="w-28">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index} className="hover:bg-black/5">
                        <TableCell>
                            <Input
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Item"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            ${(item.total || 0).toFixed(2)}
                          </p>
                        </TableCell>
                        <TableCell>
                            <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                placeholder="Add a tag"
                className=""
              />
              <Button onClick={addTag} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="border-indigo-200">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional details..."
              rows={3}
              className=""
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t  pt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(formData)}
            className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg dark:shadow-gray-500/10"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Receipt
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
