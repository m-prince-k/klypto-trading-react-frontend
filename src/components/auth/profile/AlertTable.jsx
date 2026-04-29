import React from "react";
import { Table, Badge, Button, ButtonGroup, Form } from "react-bootstrap";
import { Pencil, Trash2, BellOff, Bell } from "lucide-react";
import { formatSmartDate } from "../../../util/scannerFunctions";

const ConditionPill = ({ text }) => (
  <Badge
    bg="warning"
    text="dark"
    className="rounded-pill px-2 py-1"
    style={{ fontSize: "11px" }}
  >
    {text}
  </Badge>
);

const StatusBadge = ({ active }) => (
  <Badge
    bg={active ? "success" : "secondary"}
    className="rounded-pill px-2 py-1"
    style={{ fontSize: "11px" }}
  >
    {active ? "Active" : "Inactive"}
  </Badge>
);

export default function AlertTable({ alerts, onEdit, onDelete, onToggle }) {
  if (!alerts?.length) {
    return (
      <div className="text-center text-muted py-5">No alerts found.</div>
    );
  }

  return (
    <div className="table-responsive rounded border">
      <Table hover className="mb-0 align-items-start text-start">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            {/* <th>Description</th> */}
            <th>Condition</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id ?? alert.label}>
              <td>
                <span
                  className="fw-semibold text-primary"
                  style={{ cursor: "pointer", fontSize: "15px" }}
                >
                  {alert.alert_name}
                </span>
              </td>
              {/* <td className="text-muted">{alert.description || "—"}</td> */}
              <td>
                <ConditionPill text={alert.rule} />
              </td>
              <td>
                <StatusBadge active={alert.active} />
              </td>
              <td className="text-muted small">
                {formatSmartDate(alert.createdAt)}
              </td>
              <td>
                <ButtonGroup size="sm">
                  <Button
                    variant="outline-secondary"
                    onClick={() => onToggle?.(alert)}
                    title={alert.active ? "Disable alert" : "Enable alert"}
                  >
                    {alert.active ? <BellOff size={13} /> : <Bell size={13} />}
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => onEdit?.(alert)}
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => onDelete?.(alert)}
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