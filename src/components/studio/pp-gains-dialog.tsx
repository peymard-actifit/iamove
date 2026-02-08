"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { PP_GAINS } from "@/lib/pp-rules";

interface PPGainsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PPGainsDialog({ open, onOpenChange }: PPGainsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Gains en Points de Participation (PP)</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Seul l&apos;usage du site publié (pas le studio) fait gagner des PP. Ce tableau pourra être complété par la suite.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">PP</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PP_GAINS.map((row) => (
              <TableRow key={row.action}>
                <TableCell className="font-mono font-semibold">{row.pp}</TableCell>
                <TableCell>{row.label}</TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">{row.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
