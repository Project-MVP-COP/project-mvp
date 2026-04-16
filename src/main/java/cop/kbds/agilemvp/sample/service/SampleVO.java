package cop.kbds.agilemvp.sample.service;

public record SampleVO(String message) {

    public boolean isValid() {
        return message != null && !message.trim().isEmpty();
    }
}
