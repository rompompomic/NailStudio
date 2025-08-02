import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LogOut, Upload, Trash2, Edit, Plus, User, Settings, MessageSquare, FileImage, Phone } from "lucide-react";
import AdminBlockEditor from "@/components/admin-block-editor";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest("POST", "/api/admin/login", { password });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoggedIn(true);
      setToken(data.token);
      toast({ title: "Успешный вход", description: "Добро пожаловать в админ-панель!" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
    },
  });

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/admin/settings"],
    enabled: isLoggedIn,
    meta: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: blocks = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/blocks"],
    enabled: isLoggedIn,
    meta: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/services"],
    enabled: isLoggedIn,
    meta: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/reviews"],
    enabled: isLoggedIn,
    meta: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/requests"],
    enabled: isLoggedIn,
    meta: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: images = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/images"],
    enabled: isLoggedIn,
    meta: { headers: { Authorization: `Bearer ${token}` } },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/admin/settings", data, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Успешно", description: "Настройки обновлены" });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/images"] });
      toast({ title: "Успешно", description: "Изображение загружено" });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/services/${id}`, null, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Успешно", description: "Услуга удалена" });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/reviews/${id}`, null, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Успешно", description: "Отзыв удален" });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/images/${id}`, null, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/images"] });
      toast({ title: "Успешно", description: "Изображение удалено" });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/services", data, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      setNewService({ name: "", description: "", price: "" });
      toast({ title: "Успешно", description: "Услуга добавлена" });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/reviews", data, {
        Authorization: `Bearer ${token}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      setNewReview({ name: "", text: "" });
      toast({ title: "Успешно", description: "Отзыв добавлен" });
    },
  });

  const [newService, setNewService] = useState({ name: "", description: "", price: "" });
  const [newReview, setNewReview] = useState({ name: "", text: "" });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center">Вход в админ-панель</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate(password)}
              />
            </div>
            <Button 
              onClick={() => loginMutation.mutate(password)}
              disabled={loginMutation.isPending}
              className="w-full"
            >
              {loginMutation.isPending ? "Вход..." : "Войти"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Админ-панель</h1>
            <Button 
              variant="outline" 
              onClick={() => setIsLoggedIn(false)}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="blocks" className="gap-2">
              <Edit className="w-4 h-4" />
              Блоки
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Plus className="w-4 h-4" />
              Услуги
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Отзывы
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Phone className="w-4 h-4" />
              Заявки
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <FileImage className="w-4 h-4" />
              Изображения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            {settings ? (
              <Card>
                <CardHeader>
                  <CardTitle>Основные настройки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="masterName">Имя мастера</Label>
                      <Input
                        id="masterName"
                        defaultValue={settings.masterName || ""}
                        onBlur={(e) => updateSettingsMutation.mutate({ masterName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="masterPhone">Телефон</Label>
                      <Input
                        id="masterPhone"
                        defaultValue={settings.masterPhone || ""}
                        onBlur={(e) => updateSettingsMutation.mutate({ masterPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="masterSignature">Подпись</Label>
                    <Input
                      id="masterSignature"
                      defaultValue={settings.masterSignature || ""}
                      onBlur={(e) => updateSettingsMutation.mutate({ masterSignature: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="masterDescription">Описание</Label>
                    <Textarea
                      id="masterDescription"
                      defaultValue={settings.masterDescription || ""}
                      onBlur={(e) => updateSettingsMutation.mutate({ masterDescription: e.target.value })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Социальные сети</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Telegram</Label>
                        <Input
                          placeholder="Имя пользователя"
                          defaultValue={settings.telegramUsername || ""}
                          onBlur={(e) => updateSettingsMutation.mutate({ telegramUsername: e.target.value })}
                        />
                      </div>
                      <Switch
                        checked={settings.telegramEnabled || false}
                        onCheckedChange={(checked) => updateSettingsMutation.mutate({ telegramEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>WhatsApp</Label>
                        <Input
                          placeholder="Номер телефона"
                          defaultValue={settings.whatsappPhone || ""}
                          onBlur={(e) => updateSettingsMutation.mutate({ whatsappPhone: e.target.value })}
                        />
                      </div>
                      <Switch
                        checked={settings.whatsappEnabled || false}
                        onCheckedChange={(checked) => updateSettingsMutation.mutate({ whatsappEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Instagram</Label>
                        <Input
                          placeholder="Имя пользователя"
                          defaultValue={settings.instagramUsername || ""}
                          onBlur={(e) => updateSettingsMutation.mutate({ instagramUsername: e.target.value })}
                        />
                      </div>
                      <Switch
                        checked={settings.instagramEnabled || false}
                        onCheckedChange={(checked) => updateSettingsMutation.mutate({ instagramEnabled: checked })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Telegram Bot</h3>
                    <div>
                      <Label htmlFor="botToken">Bot Token</Label>
                      <Input
                        id="botToken"
                        type="password"
                        placeholder="Токен от @BotFather"
                        defaultValue={settings.botToken || ""}
                        onBlur={(e) => updateSettingsMutation.mutate({ botToken: e.target.value })}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Для получения токена напишите @BotFather в Telegram и создайте нового бота
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="adminPassword">Новый пароль админа</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Оставьте пустым, чтобы не менять"
                      onBlur={(e) => e.target.value && updateSettingsMutation.mutate({ adminPassword: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Текущий пароль: admin123
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocks">
            <div className="grid gap-6">
              {blocks.map((block) => (
                <AdminBlockEditor 
                  key={block.id} 
                  block={block} 
                  token={token}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Добавить услугу</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="serviceName">Название услуги</Label>
                    <Input
                      id="serviceName"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="Например: Классический маникюр"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceDescription">Описание</Label>
                    <Textarea
                      id="serviceDescription"
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="Краткое описание услуги"
                    />
                  </div>
                  <div>
                    <Label htmlFor="servicePrice">Цена</Label>
                    <Input
                      id="servicePrice"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      placeholder="Например: 2000 ₽"
                    />
                  </div>
                  <Button 
                    onClick={() => createServiceMutation.mutate(newService)}
                    disabled={createServiceMutation.isPending || !newService.name || !newService.price}
                    className="w-full"
                  >
                    Добавить услугу
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Управление услугами</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <p className="text-sm font-medium">{service.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteServiceMutation.mutate(service.id)}
                            disabled={deleteServiceMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Пока нет услуг</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Добавить отзыв</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reviewName">Имя клиента</Label>
                    <Input
                      id="reviewName"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      placeholder="Например: Анна С."
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewText">Текст отзыва</Label>
                    <Textarea
                      id="reviewText"
                      value={newReview.text}
                      onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                      placeholder="Отзыв клиента о работе"
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={() => createReviewMutation.mutate(newReview)}
                    disabled={createReviewMutation.isPending || !newReview.name || !newReview.text}
                    className="w-full"
                  >
                    Добавить отзыв
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Управление отзывами</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{review.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{review.text}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(review.createdAt!).toLocaleString('ru-RU')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteReviewMutation.mutate(review.id)}
                              disabled={deleteReviewMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Пока нет отзывов</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Заявки клиентов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {requests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{request.name}</h4>
                          <p className="text-sm text-muted-foreground">{request.phone}</p>
                          <p className="text-sm mt-1">Услуга: {request.service}</p>
                          {request.comment && (
                            <p className="text-sm text-muted-foreground mt-1">Комментарий: {request.comment}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(request.createdAt!).toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <Badge variant="secondary">Новая</Badge>
                      </div>
                    </div>
                  ))}
                  {requests.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Пока нет заявок</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Управление изображениями</CardTitle>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('image', file);
                          uploadImageMutation.mutate(formData);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button asChild>
                        <span className="gap-2">
                          <Upload className="w-4 h-4" />
                          Загрузить
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.path}
                        alt={image.originalName}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteImageMutation.mutate(image.id)}
                          disabled={deleteImageMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{image.originalName}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
