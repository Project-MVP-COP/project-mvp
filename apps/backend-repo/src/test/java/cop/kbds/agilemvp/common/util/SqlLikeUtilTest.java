package cop.kbds.agilemvp.common.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SqlLikeUtilTest {

    @Test
    @DisplayName("SQL LIKE 메타문자를 escape 한다")
    void escape_EscapesLikeMetaCharacters() {
        assertThat(SqlLikeUtil.escape("100%_할인\\쿠폰")).isEqualTo("100\\%\\_할인\\\\쿠폰");
    }
}
