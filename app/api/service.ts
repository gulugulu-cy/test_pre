import ky from "ky";

/**
 * main_face_image：上传图片(必须)
 * prompt：提示词
 * width：图片宽度 默认值896
 * height：图片高度 默认值1152
 * num_steps：设置去噪步数（1-20）默认值20
 * start_step：设置开始插入 ID 的时间步长（建议 0-4，0 为最高保真度，4 为更高可编辑性） 默认值：0
 * guidance_scale：设置文字提示影响力指导尺度（1.0-10.0）
 * id_weight：设置ID图像影响力的权重（0.0-3.0）
 * num_outputs：设置要生成的图像数量（1-4）默认值：1
 * negative_prompt：输入负面提示以指定图像中应避免的内容 默认值：“质量差、质量最差、文本、签名、水印、额外肢体、低分辨率、部分渲染的物体、变形或部分渲染的眼睛、变形、眼球变形、斜视、模糊”
 * seed：设置生成的随机种子（留空或 -1 表示随机）
 * true_cfg：设置无分类器指导 (CFG) 比例。1.0 使用标准 CFG，而值 >1.0 则启用 True CFG，以更精确地控制生成。更高的值会增加对提示的遵守，但会以图像质量为代价。默认值：1
 * max_sequence_length：设置提示的最大序列长度（T5），越小越快（128-512）默认值：128
 * output_format：选择输出图像的格式 默认值：“webp”
 * output_quality：设置 jpg 和 webp 的输出图像质量（1-100）默认值：80
 */
interface IPrams {
  main_face_image: string;
  prompt?: string
  width?: number;
  height?: number;
  num_steps?: number;
  start_step?: number;
  guidance_scale?: number;
  id_weight?: number;
  num_outputs?: number;
  negative_prompt?: string;
  seed?: number;
  true_cfg?: number;
  max_sequence_length?: number;
  output_format?: number;
  output_quality?: number;
}
export const generate = async (apiKey: string, params: IPrams) => {
  return ky(`${process.env.NEXT_PUBLIC_API_URL}/302/submit/flux-selfie`, {
    method: 'post',
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "User-Agent": "Apifox/1.0.0 (https://apifox.com)" },
    body: JSON.stringify(params),
    timeout: false,
  }).then(res => res.json())
    .then(res => {
      return res;
    })
    .catch(async error => {
      console.log(error.options.body);
      if (error.response) {
        try {
          const errorData = await error.response.json();
          return errorData
        } catch (parseError) {
          return { error: parseError }
        }
      } else {
        return { error: error.message || 'Unknown error', }
      }
    })
}
