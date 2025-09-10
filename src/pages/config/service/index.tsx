import {
  Info,
  RotateCcw,
  Save,
  Volume2,
  Mic,
  Settings,
  Server,
  Fish,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { useListenApi } from "../../../stores/useListenApi.ts";
import { useSpeakApi } from "../../../stores/useSpeakApi.ts";

export default function ConfigServicePage() {
  const setSpeakApi = useSpeakApi((state) => state.setSpeakApi);
  const speakApiList = useSpeakApi((state) => state.speakApiList);
  const currentSpeakApi = useSpeakApi((state) => state.currentSpeakApi);
  const f5TtsEndpoint = useSpeakApi((state) => state.f5TtsEndpoint);
  const fishSpeechEndpoint = useSpeakApi((state) => state.fishSpeechEndpoint);
  const setF5TtsEndpoint = useSpeakApi((state) => state.setF5TtsEndpoint);
  const setFishSpeechEndpoint = useSpeakApi(
    (state) => state.setFishSpeechEndpoint
  );
  const setListenApi = useListenApi((state) => state.setListenApi);
  const listenApiList = useListenApi((state) => state.listenApiList);
  const currentListenApi = useListenApi((state) => state.currentListenApi);

  // Form state management
  const [f5TtsEndpointValue, setF5TtsEndpointValue] = useState(f5TtsEndpoint);
  const [fishSpeechEndpointValue, setFishSpeechEndpointValue] =
    useState(fishSpeechEndpoint);

  const [f5TtsEndpointModified, setF5TtsEndpointModified] = useState(false);
  const [fishSpeechEndpointModified, setFishSpeechEndpointModified] =
    useState(false);

  // Sync form values with store values
  useEffect(() => setF5TtsEndpointValue(f5TtsEndpoint), [f5TtsEndpoint]);
  useEffect(
    () => setFishSpeechEndpointValue(fishSpeechEndpoint),
    [fishSpeechEndpoint]
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          服务配置
        </h1>
        <p className="text-muted-foreground">配置语音合成和语音识别服务</p>
      </div>

      <TooltipProvider>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5 text-blue-600" />
              语音服务配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Speech Synthesis Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="p-2 bg-green-100 rounded-full">
                  <Volume2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    语音合成服务
                  </h3>
                  <p className="text-sm text-gray-600">配置文本转语音服务</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-blue-600 transition-colors ml-auto" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      在连续语音对话时, Safari 浏览器可能会阻止应用直接播放音频,
                      建议使用 Chrome、Edge 或 Firefox 浏览器
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  服务选择
                </Label>
                <Select
                  value={currentSpeakApi}
                  onValueChange={async (value) => {
                    await setSpeakApi(value);
                  }}
                >
                  <SelectTrigger className="h-11 border-2 focus:border-green-500 transition-colors">
                    <SelectValue placeholder="选择语音合成服务" />
                  </SelectTrigger>
                  <SelectContent>
                    {speakApiList.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* F5 TTS API Endpoint */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" />
                F5 TTS API Endpoint
                <Badge variant="secondary" className="ml-2">
                  F5 TTS
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
                        await setF5TtsEndpoint();
                        setF5TtsEndpointModified(false);
                        toast.success("F5 TTS API Endpoint 已恢复默认值");
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
                  value={f5TtsEndpointValue}
                  onChange={(e) => {
                    setF5TtsEndpointValue(e.target.value);
                    setF5TtsEndpointModified(true);
                  }}
                  placeholder="请输入 F5 TTS API Endpoint"
                  className="flex-1 h-11 border-2 focus:border-blue-500 transition-colors"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={f5TtsEndpointModified ? "default" : "outline"}
                      size="icon"
                      className={`h-11 w-11 transition-all duration-200 ${
                        f5TtsEndpointModified
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                          : "border-2 hover:bg-gray-50"
                      }`}
                      onClick={async () => {
                        await setF5TtsEndpoint(f5TtsEndpointValue);
                        setF5TtsEndpointModified(false);
                        toast.success("F5 TTS API Endpoint 已更新");
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

            {/* Fish Speech API Endpoint */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Fish className="h-4 w-4 text-purple-600" />
                Fish Speech API Endpoint
                <Badge variant="secondary" className="ml-2">
                  Fish Speech
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
                        await setFishSpeechEndpoint();
                        setFishSpeechEndpointModified(false);
                        toast.success("Fish Speech API Endpoint 已恢复默认值");
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
                  value={fishSpeechEndpointValue}
                  onChange={(e) => {
                    setFishSpeechEndpointValue(e.target.value);
                    setFishSpeechEndpointModified(true);
                  }}
                  placeholder="请输入 Fish Speech API Endpoint"
                  className="flex-1 h-11 border-2 focus:border-purple-500 transition-colors"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        fishSpeechEndpointModified ? "default" : "outline"
                      }
                      size="icon"
                      className={`h-11 w-11 transition-all duration-200 ${
                        fishSpeechEndpointModified
                          ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl"
                          : "border-2 hover:bg-gray-50"
                      }`}
                      onClick={async () => {
                        await setFishSpeechEndpoint(fishSpeechEndpointValue);
                        setFishSpeechEndpointModified(false);
                        toast.success("Fish Speech API Endpoint 已更新");
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

            {/* Speech Recognition Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Mic className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    语音识别服务
                  </h3>
                  <p className="text-sm text-gray-600">配置语音转文本服务</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  服务选择
                </Label>
                <Select
                  value={currentListenApi}
                  onValueChange={async (value) => {
                    await setListenApi(value);
                  }}
                >
                  <SelectTrigger className="h-11 border-2 focus:border-orange-500 transition-colors">
                    <SelectValue placeholder="选择语音识别服务" />
                  </SelectTrigger>
                  <SelectContent>
                    {listenApiList.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  );
}
