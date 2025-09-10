import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Save, RotateCcw, User, Bot, Brain, Info } from "lucide-react";

export default function MemoryPage() {
  const [userName, setUserName] = useState("用户");
  const [selfName, setSelfName] = useState("小助手");
  const [memoryAboutSelf, setMemoryAboutSelf] = useState("");
  const [memoryAboutUser, setMemoryAboutUser] = useState("");

  const handleSave = () => {
    // 在简化版本中，这些设置只是本地状态
    toast.success("设置已保存（本地会话有效）");
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          记忆管理
        </h1>
        <p className="text-muted-foreground">配置用户和助手的个性化设置</p>
      </div>

      {/* Main Form Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5 text-blue-600" />
            基础设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-8"
          >
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Name */}
              <div className="space-y-3">
                <Label
                  htmlFor="userName"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <User className="h-4 w-4 text-green-600" />
                  用户名称
                </Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="请输入用户名称"
                  className="h-11 border-2 focus:border-green-500 transition-colors"
                />
              </div>

              {/* Assistant Name */}
              <div className="space-y-3">
                <Label
                  htmlFor="selfName"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <Bot className="h-4 w-4 text-blue-600" />
                  助手名称
                </Label>
                <Input
                  id="selfName"
                  value={selfName}
                  onChange={(e) => setSelfName(e.target.value)}
                  placeholder="请输入助手名称"
                  className="h-11 border-2 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Memory Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                记忆配置
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Memory About Self */}
                <div className="space-y-3">
                  <Label
                    htmlFor="memoryAboutSelf"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <Bot className="h-4 w-4 text-purple-600" />
                    关于助手的记忆
                  </Label>
                  <Textarea
                    id="memoryAboutSelf"
                    value={memoryAboutSelf}
                    onChange={(e) => setMemoryAboutSelf(e.target.value)}
                    placeholder="描述助手的特点、性格等..."
                    rows={5}
                    className="border-2 focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                {/* Memory About User */}
                <div className="space-y-3">
                  <Label
                    htmlFor="memoryAboutUser"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-orange-600" />
                    关于用户的记忆
                  </Label>
                  <Textarea
                    id="memoryAboutUser"
                    value={memoryAboutUser}
                    onChange={(e) => setMemoryAboutUser(e.target.value)}
                    placeholder="记录用户的偏好、特点等..."
                    rows={5}
                    className="border-2 focus:border-orange-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                保存设置
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 border-2 hover:bg-gray-50 font-semibold transition-all duration-200"
                onClick={() => {
                  setUserName("用户");
                  setSelfName("小助手");
                  setMemoryAboutSelf("");
                  setMemoryAboutUser("");
                  toast.success("已重置为默认值");
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                重置
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">使用说明</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                在简化版本中，这些设置仅在当前会话中有效。
                如需持久化存储，可以通过记忆管理功能导出和导入数据。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
