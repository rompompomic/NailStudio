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
import { Save, Upload, Plus, Trash2, GripVertical, X } from "lucide-react";
import type { Block } from "@shared/schema";

interface AdminBlockEditorProps {
  block: Block;
  token: string;
}

interface Stat {
  label: string;
  value: string;
}

interface ImageData {
  path: string;
  width: string;
  height: string;
}

export default function AdminBlockEditor({ block, token }: AdminBlockEditorProps) {
  const [formData, setFormData] = useState({
    enabled: block.enabled,
    title: block.title,
    content: block.content || "",
    image: block.image || "",
    images: block.images ? JSON.parse(block.images).map((img: string | ImageData) => 
      typeof img === 'string' ? { path: img, width: '100%', height: '250px' } : img
    ) : [],
    stats: block.stats ? JSON.parse(block.stats) : [],
    order: block.order || 0,
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

  const deleteBlockMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/admin/blocks/${block.id}`, null, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blocks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blocks"] });
      toast({ title: "Успешно", description: "Блок удален" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось удалить блок", variant: "destructive" });
    },
  });

  const handleSave = () => {
    // Преобразуем все строковые пути изображений в объекты с размерами
    const processedImages = formData.images.map((img: ImageData | string) => 
      typeof img === 'string' ? { path: img, width: '100%', height: '250px' } : img
    );
    
    const dataToSend = {
      ...formData,
      images: processedImages.length > 0 ? JSON.stringify(processedImages) : null,
      stats: formData.stats.length > 0 ? JSON.stringify(formData.stats) : null,
    };
    updateBlockMutation.mutate(dataToSend);
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

  const handleMultipleImageUpload = async (file: File) => {
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
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, { 
            path: result.path,
            width: '100%',
            height: '250px'
          }] 
        }));
        toast({ title: "Успешно", description: "Изображение загружено" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить изображение", variant: "destructive" });
    }
  };

  const removeImage = async (index: number) => {
    setFormData(prev => {
      const imageToDelete = prev.images[index];
      const newImages = prev.images.filter((img: string, i: number) => i !== index);
      // Удаляем файл на сервере и ссылку из блока
      if (imageToDelete && imageToDelete.startsWith('/uploads/')) {
        fetch(`/api/admin/delete-upload`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: imageToDelete,
            blockId: block.id,
            imageUrl: imageToDelete
          })
        })
        .then(res => {
          if (!res.ok) throw new Error('Ошибка удаления файла');
        })
        .catch(() => {
          toast({ title: 'Ошибка', description: 'Не удалось удалить файл на сервере', variant: 'destructive' });
        });
      }
      // Обновляем локальное состояние
      const updatedData = {
        ...prev,
        images: newImages
      };

      // Используем мутацию для обновления блока на сервере
      updateBlockMutation.mutate({
        ...updatedData,
        images: newImages.length > 0 ? JSON.stringify(newImages) : null,
        stats: prev.stats.length > 0 ? JSON.stringify(prev.stats) : null,
      });

      return updatedData;
    });
  };

  const addStat = () => {
    setFormData(prev => ({
      ...prev,
      stats: [...prev.stats, { label: "", value: "" }]
    }));
  };

  const updateStat = (index: number, field: 'label' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats.map((stat: Stat, i: number) => 
        i === index ? { ...stat, [field]: value } : stat
      )
    }));
  };

  const removeStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats.filter((_: Stat, i: number) => i !== index)
    }));
  };

  const updateImageSize = (index: number, dimension: 'width' | 'height', value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img: ImageData | string, i: number) => {
        if (i !== index) return img;
        const imageData = typeof img === 'string' ? { path: img, width: '100%', height: '250px' } : img;
        return {
          ...imageData,
          [dimension]: value
        };
      })
    }));
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
                checked={formData.enabled || false}
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
            <Button 
              variant="destructive"
              size="sm"
              onClick={() => deleteBlockMutation.mutate()}
              disabled={deleteBlockMutation.isPending}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Удалить
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <Label>Основное изображение</Label>
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

        <div>
          <Label>Дополнительные изображения</Label>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMultipleImageUpload(file);
                }}
                className="hidden"
                id={`multiple-image-upload-${block.id}`}
              />
              <label htmlFor={`multiple-image-upload-${block.id}`}>
                <Button asChild variant="outline" className="gap-2">
                  <span>
                    <Plus className="w-4 h-4" />
                    Добавить изображение
                  </span>
                </Button>
              </label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((imageData: string | ImageData, index: number) => {
                const imageInfo = typeof imageData === 'string' 
                  ? { path: imageData, width: '100%', height: '250px' } 
                  : imageData;
                return (
                  <div key={index} className="relative group space-y-2">
                    <div className="relative">
                      <img
                        src={imageInfo.path}
                        alt={`Image ${index + 1}`}
                        className="w-full object-cover rounded-lg"
                        style={{ height: imageInfo.height }}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Высота (px)</Label>
                        <Input
                          type="number"
                          value={parseInt(imageInfo.height) || 250}
                          onChange={(e) => updateImageSize(index, 'height', `${e.target.value}px`)}
                          className="h-7 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Ширина (%)</Label>
                        <Input
                          type="number"
                          value={parseInt(imageInfo.width) || 100}
                          onChange={(e) => updateImageSize(index, 'width', `${e.target.value}%`)}
                          className="h-7 text-sm"
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <Label>Статистика</Label>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={addStat}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить статистику
            </Button>
            
            {formData.stats.map((stat: Stat, index: number) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label>Число</Label>
                    <Input
                      value={stat.label}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      placeholder="5+"
                    />
                  </div>
                  <div>
                    <Label>Описание</Label>
                    <Input
                      value={stat.value}
                      onChange={(e) => updateStat(index, 'value', e.target.value)}
                      placeholder="лет опыта"
                    />
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeStat(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor={`order-${block.id}`}>Порядок</Label>
          <Input
            id={`order-${block.id}`}
            type="number"
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
            placeholder="0"
          />
        </div>
      </CardContent>
    </Card>
  );
}
