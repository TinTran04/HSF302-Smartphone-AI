package com.smartphoneai.service.impl;

import com.smartphoneai.exception.InvalidProductImageException;
import com.smartphoneai.exception.ProductImageNotFoundException;
import com.smartphoneai.exception.ProductImageStorageException;
import com.smartphoneai.service.ProductImageService;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.MemoryCacheImageInputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductImageServiceImpl implements ProductImageService {
    private static final int MAX_BYTES = 5 * 1024 * 1024;
    private static final int MAX_DIMENSION = 10000;
    private static final long MAX_PIXELS = 25_000_000;
    private static final Pattern STORED_NAME = Pattern.compile("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(png|jpg|webp)");
    private final Path directory;

    public ProductImageServiceImpl(@Value("${app.product-images.directory:./uploads/product-images}") String directory) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
    }

    @Override
    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new InvalidProductImageException();
        if (file.getSize() > MAX_BYTES) throw new InvalidProductImageException(true);
        byte[] bytes;
        try (var input = file.getInputStream()) { bytes = input.readNBytes(MAX_BYTES + 1); }
        catch (IOException ex) { throw new InvalidProductImageException(); }
        if (bytes.length > MAX_BYTES) throw new InvalidProductImageException(true);
        String extension = validate(bytes);
        String filename = UUID.randomUUID() + "." + extension;
        try {
            Files.createDirectories(directory);
            Files.write(directory.resolve(filename), bytes, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
        } catch (IOException ex) { throw new ProductImageStorageException(); }
        return "/api/product-images/" + filename;
    }

    @Override
    public Image read(String filename) {
        if (filename == null || !STORED_NAME.matcher(filename).matches()) throw new ProductImageNotFoundException();
        Path path = directory.resolve(filename).normalize();
        if (!path.getParent().equals(directory) || !Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS))
            throw new ProductImageNotFoundException();
        try (var input = Files.newInputStream(path, LinkOption.NOFOLLOW_LINKS)) {
            byte[] bytes = input.readNBytes(MAX_BYTES + 1);
            if (bytes.length == 0 || bytes.length > MAX_BYTES) throw new ProductImageNotFoundException();
            String type = filename.endsWith(".png") ? "image/png" : filename.endsWith(".jpg") ? "image/jpeg" : "image/webp";
            return new Image(bytes, type);
        } catch (IOException ex) { throw new ProductImageNotFoundException(); }
    }

    private static String validate(byte[] bytes) {
        String expected;
        if (bytes.length >= 8 && bytes[0] == (byte)0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G'
                && bytes[4] == 13 && bytes[5] == 10 && bytes[6] == 26 && bytes[7] == 10) expected = "png";
        else if (bytes.length >= 3 && bytes[0] == (byte)0xff && bytes[1] == (byte)0xd8 && bytes[2] == (byte)0xff) expected = "jpeg";
        else if (bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P'
                && riffSize(bytes) == bytes.length - 8) expected = "webp";
        else throw new InvalidProductImageException();
        ImageReader reader = null;
        try (var input = new MemoryCacheImageInputStream(new ByteArrayInputStream(bytes))) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new InvalidProductImageException();
            reader = readers.next();
            if (!reader.getFormatName().toLowerCase(Locale.ROOT).equals(expected)) throw new InvalidProductImageException();
            reader.setInput(input, true, true);
            int width = reader.getWidth(0), height = reader.getHeight(0);
            if (width < 1 || height < 1 || width > MAX_DIMENSION || height > MAX_DIMENSION || (long) width * height > MAX_PIXELS)
                throw new InvalidProductImageException();
            var image = reader.read(0);
            if (image == null || image.getWidth() != width || image.getHeight() != height) throw new InvalidProductImageException();
            return expected.equals("jpeg") ? "jpg" : expected;
        } catch (IOException | RuntimeException ex) { throw new InvalidProductImageException(); }
        finally { if (reader != null) reader.dispose(); }
    }

    private static long riffSize(byte[] bytes) {
        return (bytes[4] & 255L) | ((bytes[5] & 255L) << 8) | ((bytes[6] & 255L) << 16) | ((bytes[7] & 255L) << 24);
    }
}
