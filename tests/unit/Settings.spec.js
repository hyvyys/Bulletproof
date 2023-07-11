import { mount } from "@vue/test-utils";
import Settings from "@/components/Settings.vue";
import SettingDefinitions from "@/models/Settings";

describe("Settings.vue", () => {
  it("can change font size", async () => {
    const mockStore = {
      getters: {
        settings: SettingDefinitions.getDefaults(),
      },
      commit: jest.fn(),
    };

    const wrapper = mount(Settings, {
      mocks: {
        $store: mockStore,
      },
    });

    const newFontSize = 36;
    wrapper.vm.$refs.settingFontSize.$emit("input", newFontSize);
    await wrapper.vm.$nextTick();
    expect(mockStore.commit).toHaveBeenCalledWith("updateSettings", { fontSize: 36 });
  });
});
