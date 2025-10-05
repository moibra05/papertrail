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
import { createClient } from "../../../../utils/supabase/client";

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
    folder_id: "",
    file: extractedData?.file || null,
  });
  const [folders, setFolders] = React.useState([]);
  const [newTag, setNewTag] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const supabase = createClient();

  React.useEffect(() => {
    loadFolders();
  }, []);

  // Helper: compute sum of items totals (falls back to qty*unit_price)
  const computeItemsSum = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce(
      (acc, it) =>
        acc +
        (Number(it.total) ||
          Number(it.quantity || 0) * Number(it.unit_price || 0)),
      0
    );
  };

  const loadFolders = async () => {
    const { data: folders } = await supabase.from("folders").select("*");
    setFolders(folders || []);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // clear field-level errors when user updates a value
    setErrors((prev) => {
      const next = { ...prev };

      if (field === "merchant" && value && value.toString().trim()) {
        delete next.merchant;
      }

      if (field === "purchase_date" && value) {
        delete next.purchase_date;
      }

      // total amount: clear if numeric and > 0; also check against items sum
      if (field === "total_amount") {
        const totalNum = Number(value);
        if (!Number.isNaN(totalNum) && totalNum > 0) {
          // if items exist, only clear total error if sums match closely
          if (formData.items && formData.items.length > 0) {
            const itemsSum = formData.items.reduce(
              (acc, it) =>
                acc +
                (Number(it.total) ||
                  Number(it.quantity || 0) * Number(it.unit_price || 0)),
              0
            );
            if (Math.abs(itemsSum - totalNum) <= 0.05) {
              delete next.total_amount;
            }
          } else {
            delete next.total_amount;
          }
        }
      }

      // items updated via handleChange('items', newItems) will be handled in handleItemChange
      if (field === "items" && Array.isArray(value)) {
        // validate items and remove items error entries if corrected
        const itemErrors = next.items ? { ...next.items } : {};
        value.forEach((it, idx) => {
          const msgs = [];
          if (!it.description || !it.description.toString().trim())
            msgs.push("Description required");
          if (Number.isNaN(Number(it.quantity)) || Number(it.quantity) <= 0)
            msgs.push("Quantity must be > 0");
          if (Number.isNaN(Number(it.unit_price)) || Number(it.unit_price) < 0)
            msgs.push("Unit price must be >= 0");
          if (msgs.length === 0 && itemErrors[idx]) delete itemErrors[idx];
        });
        if (Object.keys(itemErrors).length === 0) delete next.items;
        else next.items = itemErrors;

        // if items changed, re-check total amount mismatch
        const itemsSum = value.reduce(
          (acc, it) =>
            acc +
            (Number(it.total) ||
              Number(it.quantity || 0) * Number(it.unit_price || 0)),
          0
        );
        const totalNum = Number(formData.total_amount);
        if (!Number.isNaN(totalNum) && Math.abs(itemsSum - totalNum) <= 0.05) {
          delete next.total_amount;
        }
      }

      return next;
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unit_price") {
      newItems[index].total =
        (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
    }
    // update items (this also triggers validation via handleChange)
    handleChange("items", newItems);
    // auto-update total = items sum + tax
    const itemsSum = computeItemsSum(newItems);
    const tax = Number(formData.tax_amount) || 0;
    setFormData((prev) => ({
      ...prev,
      total_amount: Number((itemsSum + tax).toFixed(2)),
    }));
    // additionally clear specific item error if it becomes valid
    setErrors((prev) => {
      const next = { ...prev };
      if (next.items && next.items[index]) {
        const it = newItems[index];
        const msgs = [];
        if (!it.description || !it.description.toString().trim())
          msgs.push("Description required");
        if (Number.isNaN(Number(it.quantity)) || Number(it.quantity) <= 0)
          msgs.push("Quantity must be > 0");
        if (Number.isNaN(Number(it.unit_price)) || Number(it.unit_price) < 0)
          msgs.push("Unit price must be >= 0");
        if (msgs.length === 0) {
          const copy = { ...next.items };
          delete copy[index];
          if (Object.keys(copy).length === 0) delete next.items;
          else next.items = copy;
        } else {
          next.items = { ...next.items, [index]: msgs.join(", ") };
        }
      }

      // update total_amount error if totals now match
      if (newItems.length > 0) {
        const itemsSum = newItems.reduce(
          (acc, it) =>
            acc +
            (Number(it.total) ||
              Number(it.quantity || 0) * Number(it.unit_price || 0)),
          0
        );
        const totalNum = Number(formData.total_amount);
        if (!Number.isNaN(totalNum) && Math.abs(itemsSum - totalNum) <= 0.05) {
          delete next.total_amount;
        }
      }

      return next;
    });
  };

  const addItem = () => {
    const newItems = [
      ...formData.items,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ];
    handleChange("items", newItems);
    const itemsSum = computeItemsSum(newItems);
    const tax = Number(formData.tax_amount) || 0;
    setFormData((prev) => ({
      ...prev,
      total_amount: Number((itemsSum + tax).toFixed(2)),
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    handleChange("items", newItems);
    const itemsSum = computeItemsSum(newItems);
    const tax = Number(formData.tax_amount) || 0;
    setFormData((prev) => ({
      ...prev,
      total_amount: Number((itemsSum + tax).toFixed(2)),
    }));
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

  const validateForm = () => {
    const errs = {};

    if (!formData.merchant || !formData.merchant.toString().trim()) {
      errs.merchant = "Merchant is required";
    }

    if (!formData.purchase_date) {
      errs.purchase_date = "Purchase date is required";
    }

    // compute authoritative total from items + tax to avoid race conditions
    const computedItemsSum = computeItemsSum(formData.items);
    const computedTotal = Number(
      (computedItemsSum + (Number(formData.tax_amount) || 0)).toFixed(2)
    );
    if (computedTotal < 0 || Number.isNaN(computedTotal)) {
      errs.total_amount = "Total amount must be greater than or equal to 0";
    }
    // ensure the formData shows the computed total (keeps UI consistent)
    if (Number(formData.total_amount) !== computedTotal) {
      setFormData((prev) => ({ ...prev, total_amount: computedTotal }));
    }

    // validate items
    const itemErrors = {};
    let itemsSum = 0;
    formData.items.forEach((it, idx) => {
      const msgs = [];
      if (!it.description || !it.description.toString().trim())
        msgs.push("Description required");
      if (Number.isNaN(Number(it.quantity)) || Number(it.quantity) <= 0)
        msgs.push("Quantity must be > 0");
      if (Number.isNaN(Number(it.unit_price)))
        msgs.push("Unit price must be a number");
      if (msgs.length) itemErrors[idx] = msgs.join(", ");
      itemsSum +=
        Number(it.total) ||
        Number(it.quantity || 0) * Number(it.unit_price || 0);
    });
    if (Object.keys(itemErrors).length) errs.items = itemErrors;

    // if items exist, the computed total already reflects itemsSum + tax, so no mismatch error
    // (we updated formData.total_amount above to the computed value)

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    } else {
      // focus first error (optional)
      const firstKey = Object.keys(errors)[0];
      if (firstKey === "merchant") {
        const el = document.getElementById("merchant");
        el?.focus();
      }
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-0 bg-surface backdrop-blur-sm shadow-xl">
        <CardHeader className="border-b ">
          <CardTitle className="text-2xl font-bold text-foreground">
            Review & Edit Receipt
          </CardTitle>
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
              {errors.merchant && (
                <p className="text-sm text-red-600">{errors.merchant}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleChange("purchase_date", e.target.value)}
                className="border-subtle"
              />
              {errors.purchase_date && (
                <p className="text-sm text-red-600">{errors.purchase_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount (Read Only) *</Label>
              <Input
                id="total_amount"
                type="number"
                value={formData.total_amount}
                readOnly
                className=""
              />
              {errors.total_amount && (
                <p className="text-sm text-red-600">{errors.total_amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_amount">Tax Amount</Label>
              <Input
                id="tax_amount"
                type="number"
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => {
                  const tax = Number(parseFloat(e.target.value)) || 0;
                  // update tax and recompute total
                  handleChange("tax_amount", tax);
                  const itemsSum = computeItemsSum(formData.items);
                  setFormData((prev) => ({
                    ...prev,
                    total_amount: Number((itemsSum + tax).toFixed(2)),
                  }));
                }}
                className=""
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
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
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleChange("payment_method", value)}
              >
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
              <Select
                value={formData.folder_id}
                onValueChange={(value) => handleChange("folder_id", value)}
              >
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
                          {errors.items && errors.items[index] && (
                            <p className="text-xs text-red-600">
                              {errors.items[index]}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "unit_price",
                                parseFloat(e.target.value)
                              )
                            }
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
            onClick={handleSubmit}
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
