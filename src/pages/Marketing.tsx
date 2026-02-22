import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Facebook, BarChart3, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "marketing_config";

interface MarketingConfig {
  metaPixelId: string;
  metaAccessToken: string;
  metaTestEventCode: string;
  gtmContainerId: string;
}

const defaultConfig: MarketingConfig = {
  metaPixelId: "",
  metaAccessToken: "",
  metaTestEventCode: "",
  gtmContainerId: "",
};

const loadConfig = (): MarketingConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultConfig, ...JSON.parse(stored) };
  } catch (e) {
    console.error("Erro ao carregar config de marketing:", e);
  }
  return defaultConfig;
};

const Marketing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [config, setConfig] = useState<MarketingConfig>(loadConfig);

  const handleChange = (field: keyof MarketingConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      toast({
        title: "Configurações salvas!",
        description: "As configurações de marketing foram atualizadas com sucesso.",
      });
    } catch (e) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin-dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Marketing &amp; Rastreamento</h1>
      </div>

      <div className="space-y-6">
        {/* Meta Pixel */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Facebook className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Meta Pixel (Facebook)</CardTitle>
                <CardDescription>
                  Insira o ID do Pixel para rastrear eventos no seu cardápio.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaPixelId">ID do Pixel</Label>
              <Input
                id="metaPixelId"
                placeholder="Ex: 1056176321723068"
                value={config.metaPixelId}
                onChange={(e) => handleChange("metaPixelId", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Meta CAPI */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-full">
                <Code2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg">API de Conversões (CAPI) — Meta</CardTitle>
                <CardDescription>
                  Configure o token de acesso e o código de evento de teste para enviar eventos server-side ao Meta.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaAccessToken">Token de Acesso (Access Token)</Label>
              <Textarea
                id="metaAccessToken"
                placeholder="Cole aqui o Access Token gerado no Gerenciador de Eventos"
                className="font-mono text-xs min-h-[80px]"
                value={config.metaAccessToken}
                onChange={(e) => handleChange("metaAccessToken", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Gere o token em: Gerenciador de Eventos → Configurações → API de Conversões → Gerar token de acesso.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaTestEventCode">Código de Evento de Teste (opcional)</Label>
              <Input
                id="metaTestEventCode"
                placeholder="Ex: TEST12345"
                value={config.metaTestEventCode}
                onChange={(e) => handleChange("metaTestEventCode", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use para validar eventos na aba "Eventos de Teste" do Gerenciador de Eventos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Google Tag Manager */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Google Tag Manager</CardTitle>
                <CardDescription>
                  Insira o ID do contêiner GTM para gerenciar tags e eventos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gtmContainerId">ID do Contêiner GTM</Label>
              <Input
                id="gtmContainerId"
                placeholder="Ex: GTM-NXM954Z3"
                value={config.gtmContainerId}
                onChange={(e) => handleChange("gtmContainerId", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full gap-2" size="lg">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default Marketing;
