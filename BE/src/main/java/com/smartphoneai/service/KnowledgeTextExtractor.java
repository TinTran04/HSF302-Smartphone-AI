package com.smartphoneai.service;

import com.smartphoneai.exception.InvalidKnowledgeFileException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import java.nio.ByteBuffer;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class KnowledgeTextExtractor {
    public record Page(Integer pageNumber, String text) {}
    public record Chunk(Integer pageNumber, String text) {}
    public List<Page> extract(String name, byte[] data) {
        if (name==null || data==null || data.length==0 || data.length>10*1024*1024) throw new InvalidKnowledgeFileException();
        String lower=name.toLowerCase(Locale.ROOT);
        try {
            if (lower.endsWith(".txt")) {
                var decoder=StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT);
                String text=decoder.decode(ByteBuffer.wrap(data)).toString().replace("\uFEFF", "").trim();
                if (text.isBlank() || text.indexOf('\0')>=0) throw new InvalidKnowledgeFileException();
                return List.of(new Page(null,text));
            }
            if (lower.endsWith(".pdf")) {
                try (var pdf=Loader.loadPDF(data)) {
                    if (pdf.getNumberOfPages()>200 || pdf.getNumberOfPages()==0) throw new InvalidKnowledgeFileException();
                    var pages=new ArrayList<Page>(); var stripper=new PDFTextStripper();
                    for (int page=1; page<=pdf.getNumberOfPages(); page++) {
                        stripper.setStartPage(page); stripper.setEndPage(page);
                        String text=stripper.getText(pdf).trim();
                        if (!text.isBlank()) pages.add(new Page(page,text));
                    }
                    if (pages.isEmpty()) throw new InvalidKnowledgeFileException();
                    return List.copyOf(pages);
                }
            }
        } catch (InvalidKnowledgeFileException ex) { throw ex; }
        catch (Exception ex) { throw new InvalidKnowledgeFileException(); }
        throw new InvalidKnowledgeFileException();
    }
    public List<Chunk> split(List<Page> pages) {
        var chunks=new ArrayList<Chunk>();
        for (var page : pages) {
            String text=page.text(); int count=text.codePointCount(0,text.length());
            for (int start=0; start<count;) {
                int end=Math.min(start+1500,count);
                String chunk=text.substring(text.offsetByCodePoints(0,start),text.offsetByCodePoints(0,end)).trim();
                if (!chunk.isBlank()) chunks.add(new Chunk(page.pageNumber(),chunk));
                if (end==count) break;
                start=end-200;
            }
        }
        return List.copyOf(chunks);
    }
}
