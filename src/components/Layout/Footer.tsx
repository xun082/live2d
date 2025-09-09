import { ExportOutlined, LoadingOutlined } from "@ant-design/icons";
import { version } from "../../../package.json";
import { useStates } from "../../hooks/useStates";
import { openLink } from "../../lib/utils";

export function Footer() {
  const disabled = useStates((state) => state.disabled);

  return (
    <div className="w-full h-full flex items-center justify-center text-xs">
      <div className="grid grid-cols-[5.8rem_1fr_5.8rem] gap-3">
        <div className="flex justify-center items-center border border-blue-900 rounded-md py-[0.1rem] bg-white">
          <div className="mr-1">数字生命</div>
          <div>{version}</div>
        </div>
        <div className="flex justify-center items-center border border-blue-900 rounded-md px-[0.4rem] py-[0.1rem] bg-white">
          <div className="mr-1">当前状态:</div>
          <div className="flex justify-center items-center">
            {disabled === false ? (
              "空闲"
            ) : disabled === true ? (
              <div className="flex justify-center items-center gap-[0.3rem]">
                <div>加载中</div>
                <div className="flex items-center justify-center">
                  <LoadingOutlined />
                </div>
              </div>
            ) : (
              disabled
            )}
          </div>
        </div>
        <button
          type="button"
          className="cursor-pointer flex justify-center items-center border border-blue-900 rounded-md py-[0.1rem] bg-white"
          onClick={() => openLink("https://github.com/LeafYeeXYZ/DigitalLife")}
        >
          <div className="mr-1">GitHub</div>
          <ExportOutlined />
        </button>
      </div>
    </div>
  );
}
