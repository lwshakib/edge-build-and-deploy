import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function NewProjectPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            No projects found
          </h3>
          <p className="text-sm text-muted-foreground">
            You have not created any projects yet. Start by creating one.
          </p>
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}
