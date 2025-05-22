"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import * as HeroIcons from "@heroicons/react/24/outline";

const HEROICON_NAMES = Object.keys(HeroIcons).filter(name => name.endsWith("Icon"));

export default function FeatureAdminPage() {
  // Heroicon søgefelt state
  const [iconSearch, setIconSearch] = useState("");
  const filteredIcons = HEROICON_NAMES.filter(name =>
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );
  const supabase = createClientComponentClient();
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "AcademicCapIcon",
    position: 0,
  });

  // Hent features fra Supabase
  async function fetchFeatures() {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_features")
      .select("*")
      .order("position", { ascending: true });
    if (!error) setFeatures(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchFeatures();
  }, []);

  // Gem eller opdater feature
  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    if (editing) {
      await supabase
        .from("site_features")
        .update({ ...form, updated_at: new Date() })
        .eq("id", editing.id);
    } else {
      await supabase.from("site_features").insert([{ ...form }]);
    }
    setForm({ title: "", description: "", icon: "AcademicCapIcon", position: 0 });
    setEditing(null);
    fetchFeatures();
  }

  // Slet feature
  async function handleDelete(id: string) {
    setLoading(true);
    await supabase.from("site_features").delete().eq("id", id);
    fetchFeatures();
  }

  // Rediger feature
  function handleEdit(feature: any) {
    setEditing(feature);
    setForm({
      title: feature.title,
      description: feature.description,
      icon: feature.icon || "AcademicCapIcon",
      position: feature.position,
    });
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Redigér forsiden features</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div>
          <label className="block mb-1 font-medium">Titel</label>
          <Input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Beskrivelse</label>
          <Textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Ikon (søg og vælg blandt alle Heroicons)</label>
          <Input
            placeholder="Søg ikon..."
            value={iconSearch}
            onChange={e => setIconSearch(e.target.value)}
            className="mb-2"
          />
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border rounded p-2 bg-white">
            {filteredIcons.slice(0, 40).map((iconName) => {
              const IconComp = HeroIcons[iconName as keyof typeof HeroIcons];
              return (
                <button
                  key={iconName}
                  type="button"
                  className={`flex flex-col items-center p-2 rounded border ${form.icon === iconName ? "border-primary bg-muted" : "border-gray-200"}`}
                  onClick={() => setForm(f => ({ ...f, icon: iconName }))}
                  title={iconName}
                >
                  {IconComp && <IconComp className="h-6 w-6" />}
                  <span className="text-[10px] mt-1">{iconName.replace("Icon", "")}</span>
                </button>
              );
            })}
            {!filteredIcons.length && <span className="text-xs text-gray-400">Ingen ikoner matcher</span>}
          </div>
          <div className="mt-2 text-xs text-gray-500">Valgt ikon: <b>{form.icon}</b></div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Rækkefølge</label>
          <Input
            type="number"
            value={form.position}
            onChange={e => setForm(f => ({ ...f, position: Number(e.target.value) }))}
            min={0}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {editing ? "Opdater feature" : "Tilføj feature"}
        </Button>
        {editing && (
          <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({ title: "", description: "", icon: "AcademicCapIcon", position: 0 }); }}>
            Annullér
          </Button>
        )}
      </form>
      <div className="space-y-4">
        {features.map(feature => (
          <Card key={feature.id} className="flex items-center gap-4 p-4 justify-between">
            <div className="flex items-center gap-4">
              {(() => {
                const IconComp = HeroIcons[feature.icon as keyof typeof HeroIcons];
                return IconComp ? <IconComp className="h-6 w-6" /> : <HeroIcons.AcademicCapIcon className="h-6 w-6" />;
              })()}
              <div>
                <div className="font-semibold">{feature.title}</div>
                <div className="text-sm text-muted-foreground">{feature.description}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(feature)}>
                Redigér
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(feature.id)}>
                Slet
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
