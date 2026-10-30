package com.smartphoneai.knowledge;

import com.smartphoneai.exception.InvalidKnowledgeFileException;
import com.smartphoneai.service.KnowledgeTextExtractor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.*;

class KnowledgeTextExtractorTest {
    private final KnowledgeTextExtractor extractor=new KnowledgeTextExtractor();
    @Test void extractsUtf8TextAndSplitsLongPages() {
        var pages=extractor.extract("policy.txt", ("Bảo hành "+"điện thoại ".repeat(300)).getBytes(StandardCharsets.UTF_8));
        var chunks=extractor.split(pages);
        assertTrue(chunks.size()>1);
        assertTrue(chunks.stream().allMatch(c -> c.text().codePointCount(0,c.text().length())<=1500));
        assertTrue(chunks.getFirst().text().contains("Bảo hành"));
    }
    @Test void extractsPageNumberFromPdfAndRejectsEmptyPdf() throws Exception {
        try (var pdf=new PDDocument(); var out=new ByteArrayOutputStream()) {
            var page=new PDPage(); pdf.addPage(page);
            try (var content=new PDPageContentStream(pdf,page)) {
                content.beginText(); content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA),12);
                content.newLineAtOffset(50,700); content.showText("Warranty policy"); content.endText();
            }
            pdf.save(out);
            var pages=extractor.extract("policy.pdf",out.toByteArray());
            assertEquals(1,pages.getFirst().pageNumber());
            assertTrue(pages.getFirst().text().contains("Warranty"));
        }
        try (var empty=new PDDocument(); var out=new ByteArrayOutputStream()) {
            empty.addPage(new PDPage()); empty.save(out);
            assertThrows(InvalidKnowledgeFileException.class, () -> extractor.extract("scan.pdf",out.toByteArray()));
        }
    }
    @Test void rejectsInvalidFormatsAndMalformedUtf8() {
        assertThrows(InvalidKnowledgeFileException.class, () -> extractor.extract("policy.exe",new byte[]{1}));
        assertThrows(InvalidKnowledgeFileException.class, () -> extractor.extract("policy.txt",new byte[]{(byte)0xC3,0x28}));
    }
}
