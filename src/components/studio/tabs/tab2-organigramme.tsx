"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import { Card, Button, Input } from "@/components/ui";
import { ChevronDown, Plus, Minus, Maximize, Minimize, Scan, Printer } from "lucide-react";
import { getLevelIcon, getLevelInfo } from "@/lib/levels";

interface Person {
  id: string;
  name: string;
  email: string;
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
  currentUserEmail?: string;
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

function LevelBadgeWithTooltip({ levelNumber }: { levelNumber: number }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const levelInfo = getLevelInfo(levelNumber);
  const levelIcon = getLevelIcon(levelNumber, "h-3.5 w-3.5");

  const handleMouseEnter = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 5000);
  };

  return (
    <div className="relative inline-block">
      <span 
        className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1 cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span>Niv. {levelNumber}</span>
        {levelIcon}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-gray-900 text-white rounded shadow-lg z-50 whitespace-nowrap text-center">
          <p className="text-[10px] font-medium">{levelInfo.name}</p>
          <p className="text-[10px] text-gray-300">{levelInfo.seriousGaming}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

function OrgNodeComponent({ 
  node, 
  level = 0, 
  currentUserEmail 
}: { 
  node: OrgNode; 
  level?: number;
  currentUserEmail?: string;
}) {
  const hasChildren = node.children.length > 0;
  const isCurrentUser = currentUserEmail && node.person.email.toLowerCase() === currentUserEmail.toLowerCase();
  
  // Combiner Service / Poste sur une ligne
  const servicePoste = [node.person.department, node.person.jobTitle].filter(Boolean).join(" / ");

  return (
    <div className="flex flex-col items-center">
      <Card className={`p-3 min-w-[180px] text-center transition-shadow ${
        isCurrentUser 
          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg shadow-blue-200 dark:shadow-blue-900/50" 
          : "hover:shadow-md"
      }`}>
        <h4 className={`font-semibold text-sm ${isCurrentUser ? "text-blue-700 dark:text-blue-300" : ""}`}>
          {node.person.name}
          {isCurrentUser && <span className="ml-1 text-xs">(vous)</span>}
        </h4>
        {servicePoste && (
          <p className="text-xs text-gray-500 mt-0.5">{servicePoste}</p>
        )}
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          <LevelBadgeWithTooltip levelNumber={node.person.currentLevel} />
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
                <OrgNodeComponent node={child} level={level + 1} currentUserEmail={currentUserEmail} />
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
  currentUserEmail,
}: Tab2OrganigrammeProps) {
  const orgTree = useMemo(() => buildOrgTree(persons), [persons]);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [editingZoom, setEditingZoom] = useState(false);
  const [zoomInput, setZoomInput] = useState("100");

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(200, z + 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(25, z - 10));
  }, []);

  const handleZoomChange = useCallback((value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 25 && num <= 200) {
      setZoom(num);
    }
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleFitToWindow = useCallback(() => {
    if (containerRef.current && contentRef.current) {
      const container = containerRef.current;
      const content = contentRef.current;
      const scaleX = (container.clientWidth - 40) / content.scrollWidth;
      const scaleY = (container.clientHeight - 40) / content.scrollHeight;
      const newZoom = Math.min(scaleX, scaleY) * 100;
      setZoom(Math.max(25, Math.min(200, Math.floor(newZoom))));
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleZoomDoubleClick = useCallback(() => {
    setZoom(100);
    setZoomInput("100");
    setEditingZoom(false);
  }, []);

  if (persons.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Aucune personne dans l&apos;organigramme</p>
        <p className="text-sm mt-1">Ajoutez des personnes dans l&apos;onglet Équipe</p>
      </div>
    );
  }

  return (
    <div 
      className="relative h-[calc(100vh-220px)] min-h-[400px]"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const rightEdge = rect.right - e.clientX;
        setShowZoomMenu(rightEdge < 60);
      }}
      onMouseLeave={() => setShowZoomMenu(false)}
    >
      {/* Zone de contenu zoomable */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-900 rounded-lg border"
      >
        <div 
          ref={contentRef}
          className="p-8 min-w-max"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <div className="flex justify-center gap-12">
            {orgTree.map((root) => (
              <OrgNodeComponent key={root.person.id} node={root} currentUserEmail={currentUserEmail} />
            ))}
          </div>
        </div>
      </div>

      {/* Menu de zoom (masqué par défaut, visible au survol droite) */}
      <div 
        className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-200 ${
          showZoomMenu ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-l-lg shadow-lg border border-r-0 p-2 flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomIn}
            title="Zoomer"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomOut}
            title="Dézoomer"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div 
            className="relative"
            onDoubleClick={handleZoomDoubleClick}
          >
            {editingZoom ? (
              <Input
                type="number"
                min="25"
                max="200"
                value={zoomInput}
                onChange={(e) => setZoomInput(e.target.value)}
                onBlur={() => {
                  handleZoomChange(zoomInput);
                  setEditingZoom(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleZoomChange(zoomInput);
                    setEditingZoom(false);
                  }
                }}
                className="w-14 h-8 text-xs text-center p-1"
                autoFocus
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-14 text-xs"
                onClick={() => {
                  setZoomInput(zoom.toString());
                  setEditingZoom(true);
                }}
                title="Double-clic pour 100%"
              >
                {zoom}%
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleFitToWindow}
            title="Ajuster à la fenêtre"
          >
            <Scan className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrint}
            title="Imprimer (PDF)"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
