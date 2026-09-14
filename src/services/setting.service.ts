import { api } from "@/services/api";

import type { StoreSetting, UpdateSettingPayload } from "@/types/setting";

const buildSettingFormData = (payload: UpdateSettingPayload) => {
  const formData = new FormData();

  const appendIfDefined = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  };

  appendIfDefined("cGst", payload.cGst);
  appendIfDefined("sGst", payload.sGst);
  appendIfDefined("freeDeliveryUplon", payload.freeDeliveryUplon);
  appendIfDefined("minimumOrderAmount", payload.minimumOrderAmount);
  appendIfDefined("defaultDeliveryCharge", payload.defaultDeliveryCharge);
  appendIfDefined("heading", payload.heading);
  appendIfDefined("description", payload.description);
  appendIfDefined("productId", payload.productId);

  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  return formData;
};

export const settingService = {
  async getDefaultSetting() {
    const response = await api.get<StoreSetting>("/setting");

    return response.data;
  },

  async updateSetting(payload: UpdateSettingPayload) {
    const formData = buildSettingFormData(payload);

    const response = await api.patch<StoreSetting>("/setting", formData);

    return response.data;
  },
};
