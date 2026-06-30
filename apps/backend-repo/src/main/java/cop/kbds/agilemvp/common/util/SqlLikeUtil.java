package cop.kbds.agilemvp.common.util;

public final class SqlLikeUtil {

    private SqlLikeUtil() {}

    public static String escape(String value) {
        if (value == null) {
            return null;
        }
        return value
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}
