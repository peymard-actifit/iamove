"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui";
import { User, ChevronDown } from "lucide-react";

interface Person {
  id: string;
  name: string;
  jobTitle: string | null;
  department: string | null;
  currentLevel: number;
  managerId: string | null;
  subordinates: { id: string; name: string }[];
}

interface Tab2OrganigrammeProps {
  siteId: string;
  persons: Person[];
  onSaveStart: () => void;
  onSaveDone: () => void;
  onSaveError: () => void;
}

interface OrgNode {
  person: Person;
  children: OrgNode[];
}

function buildOrgTree(persons: Person[]): OrgNode[] {
  const roots: OrgNode[] = [];
  const nodeMap = new Map<string, OrgNode>();

  // Créer tous les nœuds
  persons.forEach((person) => {
    nodeMap.set(person.id, { person, children: [] });
  });

  // Construire l'arbre
  persons.forEach((person) => {
    const node = nodeMap.get(person.id)!;
    if (person.managerId) {
      const parent = nodeMap.get(person.managerId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function OrgNodeComponent({ node, level = 0 }: { node: OrgNode; level?: number }) {
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <Card className="p-4 min-w-[200px] text-center hover:shadow-md transition-shadow">
        <div className="flex items-center justify-center mb-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
        <h4 className="font-semibold text-sm">{node.person.name}</h4>
        {node.person.jobTitle && (
          <p className="text-xs text-gray-500 mt-1">{node.person.jobTitle}</p>
        )}
        {node.person.department && (
          <p className="text-xs text-gray-400">{node.person.department}</p>
        )}
        <div className="mt-2">
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            Niveau {node.person.currentLevel}
          </span>
        </div>
      </Card>

      {hasChildren && (
        <>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
          <ChevronDown className="h-4 w-4 text-gray-400 -my-1" />
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
          
          <div className="flex gap-8 relative">
            {node.children.length > 1 && (
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-gray-300 dark:bg-gray-700"
                style={{ 
                  width: `calc(100% - 200px)`,
                  left: '50%'
                }}
              />
            )}
            {node.children.map((child) => (
              <div key={child.person.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
                <OrgNodeComponent node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Tab2Organigramme({
  siteId,
  persons,
  onSaveStart,
  onSaveDone,
  onSaveError,
}: Tab2OrganigrammeProps) {
  const orgTree = useMemo(() => buildOrgTree(persons), [persons]);

  if (persons.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Aucune personne dans l&apos;organigramme</p>
        <p className="text-sm mt-1">Ajoutez des personnes dans l&apos;onglet Équipe</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Organigramme</h2>
      
      <div className="overflow-auto p-8">
        <div className="flex justify-center gap-12">
          {orgTree.map((root) => (
            <OrgNodeComponent key={root.person.id} node={root} />
          ))}
        </div>
      </div>
    </div>
  );
}
