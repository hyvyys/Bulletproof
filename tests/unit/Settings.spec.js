import { mount } from "@vue/test-utils";
import Settings from "@/components/Settings.vue";
import settings from "@/models/settings";

function getDefaultSettings() {
  const data = {};
  Object.keys(settings).forEach(key => {
    data[key] = settings[key].default;
  });
  return data;
}

describe("Settings.vue", () => {
  it("can change font size", async() => {
    const settings = getDefaultSettings();
    const wrapper = mount(Settings, {
      propsData: { ...settings },
    });
    const newFontSize = 36;
    wrapper.vm.$refs.settingFontSize.$emit("input", newFontSize);
    await wrapper.vm.$nextTick();
    const events = wrapper.emitted("update:fontSize");
    expect(events.length).toBe(1);
    expect(events[0][0]).toBe(newFontSize);
  });
});
