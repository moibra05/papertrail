import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  ExternalLink,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  Trash2,
} from "lucide-react";
// import { Receipt } from "@/entities/Receipt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ReceiptDetailsModal({
  receipt,
  open,
  onClose,
  onDelete,
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this receipt?")) return;
    setIsDeleting(true);
    try {
      await Receipt.delete(receipt.id);
      onDelete();
      onClose();
    } catch (error) {
      console.error("Error deleting receipt:", error);
    }
    setIsDeleting(false);
  };

  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Receipt Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Merchant Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Merchant</p>
                    <p className="font-semibold text-slate-900">
                      {receipt.merchant}
                    </p>
                  </div>
                </div>
                {receipt.receipt_number && (
                  <div>
                    <p className="text-xs text-slate-500">Receipt Number</p>
                    <p className="font-medium text-slate-700">
                      {receipt.receipt_number}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Transaction Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="font-medium text-slate-700">
                      {format(new Date(receipt.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                {receipt.payment_method && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Payment Method</p>
                      <p className="font-medium text-slate-700">
                        {receipt.payment_method.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-600 font-medium">Total Amount</p>
              <p className="text-3xl font-bold text-slate-900">
                ${receipt.total_amount.toFixed(2)}
              </p>
            </div>
            {receipt.tax_amount && (
              <div className="flex justify-between items-center text-sm">
                <p className="text-slate-500">Tax</p>
                <p className="text-slate-700">
                  ${receipt.tax_amount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Categories & Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-indigo-200 text-indigo-700"
              >
                {receipt.category?.replace(/_/g, " ")}
              </Badge>
              {receipt.tags &&
                receipt.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="border-slate-200">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>

          {receipt.items && receipt.items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Line Items
              </h3>
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipt.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.unit_price?.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${item.total?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {receipt.notes && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Notes
              </h3>
              <p className="text-slate-700 bg-slate-50 rounded-lg p-4">
                {receipt.notes}
              </p>
            </div>
          )}

          {receipt.file_url && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Original Receipt
              </h3>
              <a
                href={receipt.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                View Original Receipt
              </a>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Receipt
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
