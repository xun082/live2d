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
import { useResponsive } from "../../../hooks/useResponsive";

export default function ConfigServicePage() {
  const { screenType, isMobile } = useResponsive();
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
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className={`
        flex-1 overflow-y-auto scroll-smooth
        ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}
      `}>
        <div className={`
          mx-auto space-y-6
          ${screenType === 'mobile' ? 'max-w-sm' : ''}
          ${screenType === 'tablet' ? 'max-w-2xl' : ''}
          ${screenType === 'desktop-sm' ? 'max-w-3xl' : ''}
          ${screenType === 'desktop-md' ? 'max-w-4xl' : ''}
          ${screenType === 'desktop-lg' ? 'max-w-5xl' : ''}
        `}>
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className={`
              font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
              ${isMobile ? 'text-2xl' : 'text-3xl'}
            `}>
              服务配置
            </h1>
            <p className={`
              text-muted-foreground
              ${isMobile ? 'text-sm' : 'text-base'}
            `}>
              配置语音合成和语音识别服务
            </p>
          </div>

          <TooltipProvider>
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className={`${isMobile ? 'pb-4' : 'pb-6'}`}>
                <CardTitle className={`
                  flex items-center gap-2
                  ${isMobile ? 'text-lg' : 'text-xl'}
                `}>
                  <Settings className={`text-blue-600 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  语音服务配置
                </CardTitle>
              </CardHeader>
              <CardContent className={`${isMobile ? 'space-y-6' : 'space-y-8'}`}>
            {/* Speech Synthesis Section */}
            <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className={`bg-green-100 rounded-full ${isMobile ? 'p-1.5' : 'p-2'}`}>
                  <Volume2 className={`text-green-600 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    语音合成服务
                  </h3>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>配置文本转语音服务</p>
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
                  <SelectTrigger className={`
                    border-2 focus:border-green-500 transition-colors
                    ${isMobile ? 'h-10 text-sm' : 'h-11'}
                  `}>
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
              <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`border-2 hover:bg-gray-50 transition-all duration-200 ${isMobile ? 'h-10 w-10' : 'h-11 w-11'}`}
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
                )}
                <div className={`flex gap-2 ${isMobile ? 'w-full' : 'flex-1'}`}>
                  <Input
                    value={f5TtsEndpointValue}
                    onChange={(e) => {
                      setF5TtsEndpointValue(e.target.value);
                      setF5TtsEndpointModified(true);
                    }}
                    placeholder="请输入 F5 TTS API Endpoint"
                    className={`
                      flex-1 border-2 focus:border-blue-500 transition-colors
                      ${isMobile ? 'h-10 text-sm' : 'h-11'}
                    `}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={f5TtsEndpointModified ? "default" : "outline"}
                        size="icon"
                        className={`
                          transition-all duration-200
                          ${isMobile ? 'h-10 w-10' : 'h-11 w-11'}
                          ${f5TtsEndpointModified
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
                            : "border-2 hover:bg-gray-50"
                          }
                        `}
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
                {isMobile && (
                  <Button
                    variant="outline"
                    className="w-full h-10 border-2 hover:bg-gray-50 font-medium transition-all duration-200"
                    onClick={async () => {
                      await setF5TtsEndpoint();
                      setF5TtsEndpointModified(false);
                      toast.success("F5 TTS API Endpoint 已恢复默认值");
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    恢复默认值
                  </Button>
                )}
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
              <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`border-2 hover:bg-gray-50 transition-all duration-200 ${isMobile ? 'h-10 w-10' : 'h-11 w-11'}`}
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
                )}
                <div className={`flex gap-2 ${isMobile ? 'w-full' : 'flex-1'}`}>
                  <Input
                    value={fishSpeechEndpointValue}
                    onChange={(e) => {
                      setFishSpeechEndpointValue(e.target.value);
                      setFishSpeechEndpointModified(true);
                    }}
                    placeholder="请输入 Fish Speech API Endpoint"
                    className={`
                      flex-1 border-2 focus:border-purple-500 transition-colors
                      ${isMobile ? 'h-10 text-sm' : 'h-11'}
                    `}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          fishSpeechEndpointModified ? "default" : "outline"
                        }
                        size="icon"
                        className={`
                          transition-all duration-200
                          ${isMobile ? 'h-10 w-10' : 'h-11 w-11'}
                          ${fishSpeechEndpointModified
                            ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl"
                            : "border-2 hover:bg-gray-50"
                          }
                        `}
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
                {isMobile && (
                  <Button
                    variant="outline"
                    className="w-full h-10 border-2 hover:bg-gray-50 font-medium transition-all duration-200"
                    onClick={async () => {
                      await setFishSpeechEndpoint();
                      setFishSpeechEndpointModified(false);
                      toast.success("Fish Speech API Endpoint 已恢复默认值");
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    恢复默认值
                  </Button>
                )}
              </div>
            </div>

            {/* Speech Recognition Section */}
            <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className={`bg-orange-100 rounded-full ${isMobile ? 'p-1.5' : 'p-2'}`}>
                  <Mic className={`text-orange-600 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    语音识别服务
                  </h3>
                  <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>配置语音转文本服务</p>
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
                  <SelectTrigger className={`
                    border-2 focus:border-orange-500 transition-colors
                    ${isMobile ? 'h-10 text-sm' : 'h-11'}
                  `}>
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
      </div>
    </div>
  );
}
