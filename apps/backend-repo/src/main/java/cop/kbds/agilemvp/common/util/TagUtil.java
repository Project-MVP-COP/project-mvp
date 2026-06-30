package cop.kbds.agilemvp.common.util;

public final class TagUtil {

    private TagUtil() {}

    public static String normalize(String tag) {
        if (tag == null || tag.isBlank()) {
            return null;
        }
        String trimmed = tag.trim();
        return trimmed.startsWith("#") ? trimmed : "#" + trimmed;
    }
}
