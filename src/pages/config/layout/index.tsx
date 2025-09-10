import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Image,
  RotateCcw,
  User,
  Move,
  Maximize2,
  Minimize2,
  Settings,
  Upload,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { toBase64 } from "../../../lib/utils.ts";
import { useLive2dApi } from "../../../stores/useLive2dApi.ts";

export default function ConfigLayoutPage() {
  const setLoadLive2d = useLive2dApi((state) => state.setLoadLive2d);
  const live2dList = useLive2dApi((state) => state.live2dList);
  const live2dName = useLive2dApi((state) => state.live2dName);
  const setBackground = useLive2dApi((state) => state.setBackground);
  const isFullScreen = useLive2dApi((state) => state.isFullScreen);
  const setIsFullScreen = useLive2dApi((state) => state.setIsFullScreen);
  const live2dPositionY = useLive2dApi((state) => state.live2dPositionY);
  const setLive2dPositionY = useLive2dApi((state) => state.setLive2dPositionY);
  const live2dPositionX = useLive2dApi((state) => state.live2dPositionX);
  const setLive2dPositionX = useLive2dApi((state) => state.setLive2dPositionX);
  const live2dScale = useLive2dApi((state) => state.live2dScale);
  const setLive2dScale = useLive2dApi((state) => state.setLive2dScale);
  const selfName = "小助手";

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = toBase64(await file.arrayBuffer());
      await setBackground(`data:${file.type};base64,${base64}`);
      toast.success("背景设置成功");
    } catch (e) {
      toast.error(`背景设置失败: ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          布局配置
        </h1>
        <p className="text-muted-foreground">自定义聊天形象和界面布局设置</p>
      </div>

      {/* Main Configuration Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-blue-600" />
            基础配置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Character Selection */}
          <div className="space-y-3">
            <Label
              htmlFor="live2d-model"
              className="text-sm font-semibold flex items-center gap-2"
            >
              <User className="h-4 w-4 text-green-600" />
              聊天形象
            </Label>
            <Select
              value={live2dName}
              onValueChange={async (value: string) => {
                await setLoadLive2d(value);
              }}
            >
              <SelectTrigger className="h-11 border-2 focus:border-green-500 transition-colors">
                <SelectValue placeholder="选择聊天形象" />
              </SelectTrigger>
              <SelectContent>
                {live2dList.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name.replace("{name}", selfName)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position and Scale Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              位置与缩放
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vertical Position */}
              <div className="space-y-4">
                <Label
                  htmlFor="position-y"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <Move className="h-4 w-4 text-blue-600" />
                  模型垂直位置
                  {live2dPositionY === 0
                    ? ""
                    : ` [${
                        live2dPositionY > 0
                          ? `向下偏移${live2dPositionY}像素`
                          : `向上偏移${-live2dPositionY}像素`
                      }]`}
                </Label>
                <div className="relative">
                  <Slider
                    id="position-y"
                    min={-300}
                    max={300}
                    step={5}
                    value={[live2dPositionY]}
                    onValueChange={(value: number[]) => {
                      setLive2dPositionY(value[0]);
                    }}
                    variant="gradient"
                    color="blue"
                    size="md"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>向上 300px</span>
                    <span className="font-medium text-blue-600">
                      {live2dPositionY}px
                    </span>
                    <span>向下 300px</span>
                  </div>
                </div>
              </div>

              {/* Horizontal Position */}
              <div className="space-y-4">
                <Label
                  htmlFor="position-x"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <Move className="h-4 w-4 text-purple-600" />
                  模型水平位置
                  {live2dPositionX === 0
                    ? ""
                    : ` [${
                        live2dPositionX > 0
                          ? `向右偏移${live2dPositionX}像素`
                          : `向左偏移${-live2dPositionX}像素`
                      }]`}
                </Label>
                <div className="relative">
                  <Slider
                    id="position-x"
                    min={-600}
                    max={600}
                    step={10}
                    value={[live2dPositionX]}
                    onValueChange={(value: number[]) => {
                      setLive2dPositionX(value[0]);
                    }}
                    variant="gradient"
                    color="purple"
                    size="md"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>向左 600px</span>
                    <span className="font-medium text-purple-600">
                      {live2dPositionX}px
                    </span>
                    <span>向右 600px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scale */}
            <div className="space-y-4">
              <Label
                htmlFor="scale"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <Maximize2 className="h-4 w-4 text-orange-600" />
                模型缩放
                {live2dScale === 1
                  ? ""
                  : ` [${(live2dScale * 100).toFixed(0)}%]`}
              </Label>
              <div className="relative">
                <Slider
                  id="scale"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={[live2dScale]}
                  onValueChange={(value: number[]) => {
                    setLive2dScale(value[0]);
                  }}
                  variant="gradient"
                  color="orange"
                  size="md"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>50%</span>
                  <span className="font-medium text-orange-600">
                    {(live2dScale * 100).toFixed(0)}%
                  </span>
                  <span>300%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Background Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              背景设置
            </h3>

            <div className="space-y-4">
              {/* Background Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-indigo-600" />
                  背景图片
                </Label>
                <div className="w-full">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="background-upload"
                  />
                  <Label
                    htmlFor="background-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="w-8 h-8 mb-4 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                      <p className="mb-2 text-sm text-gray-600 group-hover:text-gray-800">
                        <span className="font-semibold">点击上传</span>{" "}
                        或拖拽文件到此处
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG (最大 10MB)
                      </p>
                    </div>
                  </Label>
                </div>
              </div>

              {/* Reset Background Button */}
              <Button
                variant="outline"
                className="w-full h-11 border-2 hover:bg-gray-50 font-semibold transition-all duration-200"
                onClick={async () => {
                  await setBackground();
                  toast.success("已恢复默认背景");
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                恢复默认背景
              </Button>

              {/* Background Display Area */}
              <div className="space-y-3">
                <Label
                  htmlFor="background-display"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <Monitor className="h-4 w-4 text-teal-600" />
                  背景图片显示区域
                </Label>
                <Select
                  value={isFullScreen.toString()}
                  onValueChange={async (value: string) => {
                    await setIsFullScreen(value === "true");
                  }}
                >
                  <SelectTrigger className="h-11 border-2 focus:border-teal-500 transition-colors">
                    <SelectValue placeholder="选择显示区域" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">
                      <div className="flex items-center gap-2">
                        <Maximize2 className="h-4 w-4" />
                        全屏
                      </div>
                    </SelectItem>
                    <SelectItem value="false">
                      <div className="flex items-center gap-2">
                        <Minimize2 className="h-4 w-4" />
                        模型区域
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
