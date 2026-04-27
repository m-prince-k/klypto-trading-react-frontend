import React from "react";
import { Table, Badge, Button, ButtonGroup } from "react-bootstrap";
import { Pencil, Trash2, Share2 } from "lucide-react";
import { buildCondition, formatSmartDate } from "../../../util/scannerFunctions";

const ClausePill = ({ text }) => (
  <Badge
    bg="primary"
    className="rounded-pill px-2 py-1"
    style={{ fontSize: "11px" }}
  >
    {text}
  </Badge>
);

export default function ScanTable({ scans, onShare, onEdit, onDelete }) {
  if (!scans?.length) {
    return (
      <div className="text-center text-muted py-5">No scanners found.</div>
    );
  }

  return (
    <div className="table-responsive rounded border">
      <Table hover className="mb-0 align-items-start text-start">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Clause</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan.id ?? scan.label}>
              <td>
                <span
                  className="fw-semibold text-primary"
                  style={{ cursor: "pointer", fontSize: "15px" }}
                >
                  {scan.label}
                </span>
              </td>
              <td className="text-muted ">{scan.description || "—"}</td>
              <td>
                <ClausePill
                  // text={buildCondition(scan.condition)}
                  text={scan.condition}
                />
              </td>
              <td className="text-muted small">{formatSmartDate(scan.createdAt)}</td>
              <td>
                <ButtonGroup size="sm">
                  <Button
                    variant="outline-secondary"
                    onClick={() => onShare?.(scan)}
                  >
                    <Share2 size={13} />
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => onEdit?.(scan)}
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => onDelete?.(scan)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
