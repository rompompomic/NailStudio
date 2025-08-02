import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Upload } from "lucide-react";
import type { Block } from "@shared/schema";

interface AdminBlockEditorProps {
  block: Block;
  token: string;
}

export default function AdminBlockEditor({ block, token }: AdminBlockEditorProps) {
  const [formData, setFormData] = useState({
    enabled: block.enabled,
    title: block.title,
    content: block.content || "",
    image: block.image || "",
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateBlockMutation = useMutation({
    mutationFn: async (data: Partial<Block>) => {
      const response = await apiRequest("PUT", `/api/admin/blocks/${block.id}`, data, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blocks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blocks"] });
      toast({ title: "Успешно", description: "Блок обновлен" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить блок", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateBlockMutation.mutate(formData);
  };

  const handleImageUpload = async (file: File) => {
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, image: result.path }));
        toast({ title: "Успешно", description: "Изображение загружено" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить изображение", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">{block.blockType}</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor={`enabled-${block.id}`}>Включен</Label>
              <Switch
                id={`enabled-${block.id}`}
                checked={formData.enabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>
            <Button 
              onClick={handleSave}
              disabled={updateBlockMutation.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Сохранить
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`title-${block.id}`}>Заголовок</Label>
          <Input
            id={`title-${block.id}`}
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor={`content-${block.id}`}>Содержимое</Label>
          <Textarea
            id={`content-${block.id}`}
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={4}
          />
        </div>

        <div>
          <Label>Изображение</Label>
          <div className="flex items-center gap-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
                id={`image-upload-${block.id}`}
              />
              <label htmlFor={`image-upload-${block.id}`}>
                <Button asChild variant="outline" className="gap-2">
                  <span>
                    <Upload className="w-4 h-4" />
                    Загрузить
                  </span>
                </Button>
              </label>
            </div>
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
          </div>
          <Input
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            placeholder="URL изображения"
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
