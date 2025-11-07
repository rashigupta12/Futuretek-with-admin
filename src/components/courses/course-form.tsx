// src/components/course-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import React from "react";

export const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    {children}
  </div>
);

export const TextInput = ({
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) => (
  <Input
    type={type}
    required={required}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
);

export const DateInput = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) => (
  <Field label={label}>
    <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
  </Field>
);

export const StatusSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <Field label="Status *">
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["DRAFT", "UPCOMING", "REGISTRATION_OPEN", "ONGOING", "COMPLETED"].map((s) => (
          <SelectItem key={s} value={s}>
            {s.replace(/_/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Field>
);

export const DynamicStringList = ({
  title,
  items,
  setItems,
  placeholder,
}: {
  title: string;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{title}</CardTitle>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setItems((prev) => [...prev, ""])}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </CardHeader>
    <CardContent className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={it}
            onChange={(e) => {
              const copy = [...items];
              copy[i] = e.target.value;
              setItems(copy);
            }}
            placeholder={placeholder}
          />
          {items.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </CardContent>
  </Card>
);

export const DynamicWhyLearn = ({
  items,
  setItems,
}: {
  items: { title: string; description: string }[];
  setItems: React.Dispatch<
    React.SetStateAction<{ title: string; description: string }[]>
  >;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Why Learn</CardTitle>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          setItems((prev) => [...prev, { title: "", description: "" }])
        }
      >
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      {items.map((it, i) => (
        <div key={i} className="rounded border p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Item {i + 1}</span>
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setItems(items.filter((_, idx) => idx !== i))
                }
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Field label="Title">
            <Input
              value={it.title}
              onChange={(e) => {
                const copy = [...items];
                copy[i].title = e.target.value;
                setItems(copy);
              }}
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={2}
              value={it.description}
              onChange={(e) => {
                const copy = [...items];
                copy[i].description = e.target.value;
                setItems(copy);
              }}
            />
          </Field>
        </div>
      ))}
    </CardContent>
  </Card>
);