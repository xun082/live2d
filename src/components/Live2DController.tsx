import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Select,
  Card,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Collapse,
  Switch,
  Alert,
  Tag,
} from "antd";
import { useLive2dApi } from "../lib/hooks/useLive2dApi";
import { useLive2DMotions } from "../lib/hooks/useLive2DMotions";

const { Title, Text } = Typography;
const { Option } = Select;

export const Live2DController: React.FC = () => {
  const { live2d } = useLive2dApi();
  const {
    playRandomMotion,
    playSpecificMotion,
    playExpression,
    setParameter,
    getAvailableMotions,
  } = useLive2DMotions();

  const [motionGroups, setMotionGroups] = useState<string[]>([]);
  const [expressions, setExpressions] = useState<
    { id: string; name: string; file: string }[]
  >([]);
  const [selectedMotionGroup, setSelectedMotionGroup] = useState<string>("");
  const [motionsInGroup, setMotionsInGroup] = useState<any[]>([]);
  const [availableParams, setAvailableParams] = useState<{
    [key: string]: string;
  }>({});
  const [debugMode, setDebugMode] = useState(false);

  // Detect common parameter names for current model
  const detectAvailableParams = useCallback(() => {
    if (!live2d) return {};

    const params: { [key: string]: string } = {};

    // Common parameter patterns to test
    const paramPatterns = [
      // Head angles
      {
        key: "headX",
        candidates: ["PARAM_ANGLE_X", "ParamAngleX", "ParamBodyAngleX"],
      },
      {
        key: "headY",
        candidates: ["PARAM_ANGLE_Y", "ParamAngleY", "ParamBodyAngleY"],
      },
      {
        key: "headZ",
        candidates: ["PARAM_ANGLE_Z", "ParamAngleZ", "ParamBodyAngleZ"],
      },

      // Eyes
      {
        key: "eyeL",
        candidates: ["PARAM_EYE_L_OPEN", "ParamEyeLOpen", "ParamEyeLeftOpen"],
      },
      {
        key: "eyeR",
        candidates: ["PARAM_EYE_R_OPEN", "ParamEyeROpen", "ParamEyeRightOpen"],
      },

      // Eye position
      { key: "eyeBallX", candidates: ["PARAM_EYE_BALL_X", "ParamEyeBallX"] },
      { key: "eyeBallY", candidates: ["PARAM_EYE_BALL_Y", "ParamEyeBallY"] },

      // Mouth
      {
        key: "mouthOpen",
        candidates: ["PARAM_MOUTH_OPEN_Y", "ParamMouthOpenY"],
      },
      { key: "mouthForm", candidates: ["PARAM_MOUTH_FORM", "ParamMouthForm"] },

      // Body
      { key: "bodyX", candidates: ["PARAM_BODY_ANGLE_X", "ParamBodyAngleX"] },
      { key: "bodyY", candidates: ["PARAM_BODY_ANGLE_Y", "ParamBodyAngleY"] },
    ];

    paramPatterns.forEach((pattern) => {
      for (const candidate of pattern.candidates) {
        try {
          // Test if parameter exists by trying to set it (and immediately reset)
          const originalValue = 0; // Assume 0 is neutral
          live2d.setParam(candidate, originalValue);
          params[pattern.key] = candidate;
          break;
        } catch (error) {
          // Parameter doesn't exist, try next
        }
      }
    });

    return params;
  }, [live2d]);

  // Load available motions and expressions when model changes
  useEffect(() => {
    if (live2d) {
      try {
        const groups = live2d.getMotionGroupNames();
        const exps = live2d.getExpressions();
        const params = detectAvailableParams();

        setMotionGroups(groups);
        setExpressions(exps);
        setAvailableParams(params);

        if (groups.length > 0) {
          setSelectedMotionGroup(groups[0]);
          const motions = live2d.getMotionListByGroupName(groups[0]);
          setMotionsInGroup(motions);
        }

        if (debugMode) {
          console.log("Available motion groups:", groups);
          console.log("Available expressions:", exps);
          console.log("Detected parameters:", params);
        }
      } catch (error) {
        console.error("Error loading Live2D motion data:", error);
      }
    }
  }, [live2d, detectAvailableParams, debugMode]);

  // Update motions list when group selection changes
  useEffect(() => {
    if (live2d && selectedMotionGroup) {
      try {
        const motions = live2d.getMotionListByGroupName(selectedMotionGroup);
        setMotionsInGroup(motions);
      } catch (error) {
        console.error("Error loading motions for group:", error);
      }
    }
  }, [live2d, selectedMotionGroup]);

  // Enhanced parameter setting with fallback
  const setParamSafe = useCallback(
    (paramKey: string, value: number) => {
      const actualParam = availableParams[paramKey];
      if (actualParam) {
        setParameter(actualParam, value);
        if (debugMode) {
          console.log(`Set ${paramKey} (${actualParam}) to ${value}`);
        }
      } else {
        console.warn(`Parameter ${paramKey} not available for current model`);
      }
    },
    [availableParams, setParameter, debugMode]
  );

  // Play motion by group and index
  const playMotion = useCallback(
    async (group: string, index?: number) => {
      try {
        let result;
        if (index !== undefined) {
          result = await playSpecificMotion(group, index);
        } else {
          result = await playRandomMotion(group);
        }
        if (debugMode) {
          console.log(`Motion ${group}[${index ?? "random"}] result:`, result);
        }
        return result;
      } catch (error) {
        console.error(`Failed to play motion ${group}:`, error);
        return false;
      }
    },
    [playSpecificMotion, playRandomMotion, debugMode]
  );

  // Enhanced demo interaction handlers using detected parameters
  const handleGreeting = useCallback(() => {
    playRandomMotion("Tap");
    setTimeout(() => {
      setParamSafe("headX", 5);
    }, 500);
  }, [playRandomMotion, setParamSafe]);

  const handleGoodbye = useCallback(() => {
    playRandomMotion("FlickUp");
  }, [playRandomMotion]);

  const handleSurprise = useCallback(() => {
    setParamSafe("eyeL", 1.5);
    setParamSafe("eyeR", 1.5);
    setTimeout(() => {
      setParamSafe("eyeL", 1);
      setParamSafe("eyeR", 1);
    }, 2000);
  }, [setParamSafe]);

  const handleBlink = useCallback(() => {
    setParamSafe("eyeL", 0);
    setParamSafe("eyeR", 0);
    setTimeout(() => {
      setParamSafe("eyeL", 1);
      setParamSafe("eyeR", 1);
    }, 200);
  }, [setParamSafe]);

  const handleLookAround = useCallback(() => {
    setParamSafe("headY", -15);
    setTimeout(() => {
      setParamSafe("headY", 15);
    }, 1000);
    setTimeout(() => {
      setParamSafe("headY", 0);
    }, 2000);
  }, [setParamSafe]);

  const handleNod = useCallback(() => {
    setParamSafe("headX", -10);
    setTimeout(() => {
      setParamSafe("headX", 10);
    }, 300);
    setTimeout(() => {
      setParamSafe("headX", 0);
    }, 600);
  }, [setParamSafe]);

  if (!live2d) {
    return (
      <Card style={{ margin: "16px" }}>
        <Text type="secondary">请先加载Live2D模型</Text>
      </Card>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <Card title="Live2D 动作控制器">
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {/* Debug Mode Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text strong>调试模式: </Text>
              <Switch
                checked={debugMode}
                onChange={setDebugMode}
                checkedChildren="开"
                unCheckedChildren="关"
              />
            </div>
            {debugMode && (
              <div>
                <Tag color="blue">动作组: {motionGroups.length}</Tag>
                <Tag color="green">表情: {expressions.length}</Tag>
                <Tag color="orange">
                  参数: {Object.keys(availableParams).length}
                </Tag>
              </div>
            )}
          </div>

          {/* Status Alert */}
          {motionGroups.length === 0 && (
            <Alert
              message="当前模型没有动作定义"
              description="该模型可能只支持表情和参数控制，请查看下方的表情控制和参数控制功能。"
              type="info"
              showIcon
            />
          )}

          {/* Quick Actions */}
          <div>
            <Title level={4}>🎭 快捷动作</Title>
            <Space wrap>
              <Button
                type="primary"
                onClick={handleGreeting}
                disabled={!availableParams.headX && motionGroups.length === 0}
              >
                打招呼 👋
              </Button>
              <Button
                onClick={handleGoodbye}
                disabled={motionGroups.length === 0}
              >
                告别 🙋‍♀️
              </Button>
              <Button
                onClick={handleSurprise}
                disabled={!availableParams.eyeL && !availableParams.eyeR}
              >
                惊讶 😲
              </Button>
              <Button
                onClick={handleBlink}
                disabled={!availableParams.eyeL && !availableParams.eyeR}
              >
                眨眼 😉
              </Button>
              <Button
                onClick={handleLookAround}
                disabled={!availableParams.headY}
              >
                左右看看 👀
              </Button>
              <Button onClick={handleNod} disabled={!availableParams.headX}>
                点头 👍
              </Button>
            </Space>
          </div>

          <Divider />

          {/* Motion Groups */}
          {motionGroups.length > 0 && (
            <div>
              <Title level={4}>🎬 预设动作组</Title>
              <Space wrap>
                {motionGroups.map((group) => (
                  <Button key={group} onClick={() => playRandomMotion(group)}>
                    {group}
                  </Button>
                ))}
              </Space>
            </div>
          )}

          {motionGroups.length > 0 && <Divider />}

          {/* Emotion Controls */}
          <div>
            <Title level={4}>😊 情感表达</Title>
            <Space wrap>
              <Button
                onClick={() => {
                  setParamSafe("eyeL", 0.7);
                  setParamSafe("eyeR", 0.7);
                  setParamSafe("headX", 2);
                }}
                disabled={!availableParams.eyeL && !availableParams.eyeR}
              >
                开心 😊
              </Button>
              <Button
                onClick={() => {
                  setParamSafe("eyeL", 0.8);
                  setParamSafe("eyeR", 0.8);
                  setParamSafe("headX", -5);
                }}
                disabled={!availableParams.eyeL && !availableParams.eyeR}
              >
                难过 😢
              </Button>
              <Button
                onClick={() => {
                  setParamSafe("eyeL", 1);
                  setParamSafe("eyeR", 1);
                  setParamSafe("headX", 0);
                  setParamSafe("headY", 0);
                }}
              >
                重置表情 😐
              </Button>
            </Space>
          </div>

          <Divider />

          {/* Advanced Controls */}
          <Collapse
            items={[
              {
                key: "advanced",
                label: "🔧 高级控制",
                children: (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {/* Motion Controls */}
                    {motionGroups.length > 0 && (
                      <div>
                        <Title level={5}>动作控制 (Motions)</Title>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Text strong>选择动作组:</Text>
                            <Select
                              style={{ width: "100%", marginTop: 8 }}
                              value={selectedMotionGroup}
                              onChange={setSelectedMotionGroup}
                              placeholder="选择动作组"
                            >
                              {motionGroups.map((group) => (
                                <Option key={group} value={group}>
                                  {group}
                                </Option>
                              ))}
                            </Select>
                          </Col>
                          <Col span={12}>
                            <Text strong>播放动作:</Text>
                            <div style={{ marginTop: 8 }}>
                              <Space wrap>
                                <Button
                                  type="primary"
                                  onClick={() =>
                                    playMotion(selectedMotionGroup)
                                  }
                                >
                                  随机播放
                                </Button>
                                {motionsInGroup.map((motion, index) => (
                                  <Button
                                    key={index}
                                    onClick={() =>
                                      playMotion(selectedMotionGroup, index)
                                    }
                                  >
                                    动作 {index + 1}
                                  </Button>
                                ))}
                              </Space>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    )}

                    {motionGroups.length > 0 && <Divider />}

                    {/* Expression Controls */}
                    {expressions.length > 0 && (
                      <div>
                        <Title level={5}>表情控制 (Expressions)</Title>
                        <Space wrap>
                          {expressions.map((exp) => (
                            <Button
                              key={exp.id}
                              onClick={() => playExpression(exp.id)}
                              type="default"
                            >
                              {exp.name || exp.id}
                            </Button>
                          ))}
                        </Space>
                      </div>
                    )}

                    {expressions.length > 0 && <Divider />}

                    {/* Custom Parameter Controls */}
                    <div>
                      <Title level={5}>自定义参数控制</Title>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Text strong>头部控制:</Text>
                          <div style={{ marginTop: 8 }}>
                            <Space wrap>
                              <Button
                                onClick={() => setParamSafe("headX", 10)}
                                disabled={!availableParams.headX}
                              >
                                头部向右转
                              </Button>
                              <Button
                                onClick={() => setParamSafe("headX", -10)}
                                disabled={!availableParams.headX}
                              >
                                头部向左转
                              </Button>
                              <Button
                                onClick={() => setParamSafe("headX", 0)}
                                disabled={!availableParams.headX}
                              >
                                头部回正
                              </Button>
                            </Space>
                          </div>
                        </Col>
                        <Col span={12}>
                          <Text strong>眼部控制:</Text>
                          <div style={{ marginTop: 8 }}>
                            <Space wrap>
                              <Button
                                onClick={() => setParamSafe("eyeL", 0)}
                                disabled={!availableParams.eyeL}
                              >
                                闭左眼
                              </Button>
                              <Button
                                onClick={() => setParamSafe("eyeR", 0)}
                                disabled={!availableParams.eyeR}
                              >
                                闭右眼
                              </Button>
                              <Button
                                onClick={() => {
                                  setParamSafe("eyeL", 1);
                                  setParamSafe("eyeR", 1);
                                }}
                                disabled={
                                  !availableParams.eyeL && !availableParams.eyeR
                                }
                              >
                                睁开双眼
                              </Button>
                            </Space>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Debug Information */}
                    {debugMode && (
                      <>
                        <Divider />
                        <div>
                          <Title level={5}>调试信息</Title>
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <div>
                              <Text strong>可用动作组:</Text>
                              <div>
                                {motionGroups.length > 0
                                  ? motionGroups.join(", ")
                                  : "无"}
                              </div>
                            </div>
                            <div>
                              <Text strong>检测到的参数:</Text>
                              <div>
                                {Object.entries(availableParams).map(
                                  ([key, param]) => (
                                    <Tag
                                      key={key}
                                      color="blue"
                                      style={{ margin: 2 }}
                                    >
                                      {key}: {param}
                                    </Tag>
                                  )
                                )}
                                {Object.keys(availableParams).length === 0 &&
                                  "无"}
                              </div>
                            </div>
                            <div>
                              <Text strong>可用表情:</Text>
                              <div>
                                {expressions.length > 0
                                  ? expressions.map((e) => e.id).join(", ")
                                  : "无"}
                              </div>
                            </div>
                          </Space>
                        </div>
                      </>
                    )}
                  </Space>
                ),
              },
              {
                key: "guide",
                label: "📖 使用说明",
                children: (
                  <Space direction="vertical">
                    <Typography.Paragraph>
                      <strong>动作 (Motions):</strong>{" "}
                      完整的动画序列，包含多个参数的时间轴变化。不同模型可能有不同的动作组。
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                      <strong>表情 (Expressions):</strong>{" "}
                      快速的参数变化，通常用于表情切换。每个模型的表情文件不同。
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                      <strong>参数控制 (Parameters):</strong>{" "}
                      直接控制模型的单个参数。本控制器会自动检测当前模型支持的参数名称。
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                      <strong>智能适配:</strong>{" "}
                      控制器会自动检测当前模型的参数名称，并禁用不支持的功能按钮。
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                      <strong>调试模式:</strong>{" "}
                      开启后可以在控制台查看详细的执行日志和模型信息。
                    </Typography.Paragraph>
                  </Space>
                ),
              },
            ]}
          />
        </Space>
      </Card>
    </div>
  );
};

export default Live2DController;
