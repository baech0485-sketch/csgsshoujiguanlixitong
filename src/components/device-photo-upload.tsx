"use client";

import Image from "next/image";
import { useState } from "react";
import { compressImageFile } from "@/lib/compress-image-client";

export function DevicePhotoUpload({
  value,
  onChange,
  capture,
}: {
  value: string;
  onChange: (value: string) => void;
  capture?: "user" | "environment";
}) {
  const [message, setMessage] = useState("未选择图片");
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      onChange("");
      setMessage("未选择图片");
      setFileName("");
      return;
    }

    setIsCompressing(true);
    setMessage("压缩中...");
    setFileName(file.name);

    try {
      const compressed = await compressImageFile(file);
      onChange(compressed);
      setMessage("压缩完成，可上传到云数据库");
    } catch (error) {
      onChange("");
      setMessage(error instanceof Error ? error.message : "图片压缩失败");
      setFileName("");
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <div className="device-photo-upload">
      <div className="field__label-row">
        <span>上传手机图片</span>
        <span className="field__tag field__tag--必填">必填</span>
      </div>
      <label className="device-photo-upload__dropzone">
        <input
          className="device-photo-upload__input"
          aria-label="上传手机图片"
          type="file"
          accept="image/*"
          capture={capture}
          onChange={handleChange}
        />
        <span className="device-photo-upload__icon">+</span>
        <span className="device-photo-upload__title">
          {capture ? "点击直接拍照上传，或选择手机相册图片" : "拖拽图片到此处，或点击选择文件"}
        </span>
        <span className="device-photo-upload__desc">
          {capture
            ? "手机端会优先调起后置摄像头拍照上传；如设备不支持，也可切换到相册选择图片。"
            : "支持 JPG / PNG / WEBP，上传前会自动进行最大化压缩。"}
        </span>
      </label>
      <div className="device-photo-upload__meta">
        <span className={`field__tag ${value ? "field__tag--已完成" : "field__tag--自动生成"}`}>{value ? "已完成" : "未上传"}</span>
        <span className="panel__subtitle">{fileName ? `${fileName} · ${message}` : message}</span>
      </div>
      {value ? (
        <div className="device-photo-upload__preview">
          <Image src={value} alt="手机图片预览" width={240} height={180} unoptimized />
        </div>
      ) : null}
      {value ? <button className="button button--ghost" type="button" onClick={() => { onChange(""); setFileName(""); setMessage("未选择图片"); }}>移除图片</button> : null}
      {isCompressing ? <p className="panel__subtitle">正在进行最大化压缩，请稍候...</p> : null}
    </div>
  );
}
