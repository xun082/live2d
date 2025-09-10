import { RotateCcw, Save, Settings, Globe, Shield, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { useChatApi } from "../../../stores/useChatApi.ts";

export default function ConfigMainPage() {
  const openaiEndpoint = useChatApi((state) => state.openaiEndpoint);
  const openaiApiKey = useChatApi((state) => state.openaiApiKey);
  const openaiModelName = useChatApi((state) => state.openaiModelName);
  const setOpenaiEndpoint = useChatApi((state) => state.setOpenaiEndpoint);
  const setOpenaiApiKey = useChatApi((state) => state.setOpenaiApiKey);
  const setOpenaiModelName = useChatApi((state) => state.setOpenaiModelName);

  // Form state management
  const [endpointValue, setEndpointValue] = useState(openaiEndpoint);
  const [apiKeyValue, setApiKeyValue] = useState(openaiApiKey);
  const [modelNameValue, setModelNameValue] = useState(openaiModelName);

  const [openaiModelNameModified, setOpenaiModelNameModified] = useState(false);
  const [openaiApiKeyModified, setOpenaiApiKeyModified] = useState(false);
  const [openaiEndpointModified, setOpenaiEndpointModified] = useState(false);

  // Sync form values with store values
  useEffect(() => setEndpointValue(openaiEndpoint), [openaiEndpoint]);
  useEffect(() => setApiKeyValue(openaiApiKey), [openaiApiKey]);
  useEffect(() => setModelNameValue(openaiModelName), [openaiModelName]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          主配置
        </h1>
        <p className="text-muted-foreground">配置 AI 推理服务的连接参数</p>
      </div>

      <TooltipProvider>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5 text-blue-600" />
              API 配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* OpenAI Endpoint Configuration */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-600" />
                推理服务地址
                <Badge variant="secondary" className="ml-2">
                  OpenAI Endpoint
                </Badge>
              </Label>
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 border-2 hover:bg-gray-50 transition-all duration-200"
                      onClick={async () => {
                        await setOpenaiEndpoint();
                        setOpenaiEndpointModified(false);
                        toast.success("推理服务地址已恢复默认值");
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>恢复默认值</p>
                  </TooltipContent>
                </Tooltip>
                <Input
                  value={endpointValue}
                  onChange={(e) => {
                    setEndpointValue(e.target.value);
                    setOpenaiEndpointModified(true);
                  }}
                  placeholder="请输入推理服务地址"
                  className="flex-1 h-11 border-2 focus:border-green-500 transition-colors"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={openaiEndpointModified ? "default" : "outline"}
                      size="icon"
                      className={`h-11 w-11 transition-all duration-200 ${
                        openaiEndpointModified
                          ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
                          : "border-2 hover:bg-gray-50"
                      }`}
                      onClick={async () => {
                        if (!endpointValue)
                          return toast.error("请输入推理服务地址");
                        await setOpenaiEndpoint(
                          endpointValue.endsWith("/")
                            ? endpointValue
                            : `${endpointValue}/`
                        );
                        setOpenaiEndpointModified(false);
                        toast.success("推理服务地址已更新");
                      }}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>保存修改</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* OpenAI API Key Configuration */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                推理服务密钥
                <Badge variant="secondary" className="ml-2">
                  OpenAI API Key
                </Badge>
              </Label>
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 border-2 hover:bg-gray-50 transition-all duration-200"
                      onClick={async () => {
                        await setOpenaiApiKey();
                        setOpenaiApiKeyModified(false);
                        toast.success("推理服务密钥已恢复默认值");
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>恢复默认值</p>
                  </TooltipContent>
                </Tooltip>
                <Input
                  type="password"
                  value={apiKeyValue}
                  onChange={(e) => {
                    setApiKeyValue(e.target.value);
                    setOpenaiApiKeyModified(true);
                  }}
                  placeholder="请输入推理服务密钥"
                  className="flex-1 h-11 border-2 focus:border-blue-500 transition-colors"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={openaiApiKeyModified ? "default" : "outline"}
                      size="icon"
                      className={`h-11 w-11 transition-all duration-200 ${
                        openaiApiKeyModified
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                          : "border-2 hover:bg-gray-50"
                      }`}
                      onClick={async () => {
                        if (!apiKeyValue)
                          return toast.error("请输入推理服务密钥");
                        await setOpenaiApiKey(apiKeyValue);
                        setOpenaiApiKeyModified(false);
                        toast.success("推理服务密钥已更新");
                      }}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>保存修改</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* OpenAI Model Name Configuration */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-600" />
                推理服务模型
                <Badge variant="secondary" className="ml-2">
                  OpenAI Model Name
                </Badge>
              </Label>
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 border-2 hover:bg-gray-50 transition-all duration-200"
                      onClick={async () => {
                        await setOpenaiModelName();
                        setOpenaiModelNameModified(false);
                        toast.success("推理服务模型已恢复默认值");
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>恢复默认值</p>
                  </TooltipContent>
                </Tooltip>
                <Input
                  value={modelNameValue}
                  onChange={(e) => {
                    setModelNameValue(e.target.value);
                    setOpenaiModelNameModified(true);
                  }}
                  placeholder="请输入推理服务模型"
                  className="flex-1 h-11 border-2 focus:border-purple-500 transition-colors"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={openaiModelNameModified ? "default" : "outline"}
                      size="icon"
                      className={`h-11 w-11 transition-all duration-200 ${
                        openaiModelNameModified
                          ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl"
                          : "border-2 hover:bg-gray-50"
                      }`}
                      onClick={async () => {
                        if (!modelNameValue)
                          return toast.error("请输入推理服务模型");
                        await setOpenaiModelName(modelNameValue);
                        setOpenaiModelNameModified(false);
                        toast.success("推理服务模型已更新");
                      }}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>保存修改</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  );
}
