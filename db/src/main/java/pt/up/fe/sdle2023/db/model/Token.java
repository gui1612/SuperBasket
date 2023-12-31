package pt.up.fe.sdle2023.db.model;

import com.google.common.base.Charsets;
import com.google.protobuf.Parser;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Objects;

public record Token(long mostSignificantBits, long leastSignificantBits) implements Comparable<Token> {

//    private static class Holder {
//        static final SecureRandom numberGenerator = new SecureRandom();
//    }

    public static Token digestString(String value) {
        var valueBytes = value.getBytes(StandardCharsets.UTF_8);
        return digestBytes(valueBytes);
    }

    public static Token digestBytes(byte[] bytes) {
        MessageDigest md;
        try {
            md = MessageDigest.getInstance("MD5");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 not supported");
        }

        var digestedBytes = md.digest(bytes);
        var buffer = ByteBuffer.wrap(digestedBytes);

        var mostSignificantBits = buffer.getLong();
        var leastSignificantBits = buffer.getLong();

        return new Token(mostSignificantBits, leastSignificantBits);
    }

//    public static Token randomToken() {
//        var bytes = new byte[16];
//        Holder.numberGenerator.nextBytes(bytes);
//
//        var buffer = ByteBuffer.wrap(bytes);
//
//        var mostSignificantBits = buffer.getLong();
//        var leastSignificantBits = buffer.getLong();
//
//        return new Token(mostSignificantBits, leastSignificantBits);
//    }

    @Override
    public int compareTo(Token other) {
        var mostSignificantBitsComparison = Long.compareUnsigned(this.mostSignificantBits, other.mostSignificantBits);
        if (mostSignificantBitsComparison != 0) {
            return mostSignificantBitsComparison;
        }

        return Long.compareUnsigned(this.leastSignificantBits, other.leastSignificantBits);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Token token = (Token) o;
        return mostSignificantBits == token.mostSignificantBits && leastSignificantBits == token.leastSignificantBits;
    }

    @Override
    public int hashCode() {
        return Objects.hash(mostSignificantBits, leastSignificantBits);
    }

    public static class Serializer implements ProtoSerializer<Token, ModelProtos.Token> {
        @Override
        public ModelProtos.Token toProto(Token model) {
            return ModelProtos.Token.newBuilder()
                    .setMostSignificantBits(model.mostSignificantBits)
                    .setLeastSignificantBits(model.leastSignificantBits)
                    .build();
        }

        @Override
        public Token fromProto(ModelProtos.Token proto) {
            return new Token(proto.getMostSignificantBits(), proto.getLeastSignificantBits());
        }

        @Override
        public Parser<ModelProtos.Token> createProtoParser() {
            return ModelProtos.Token.parser();
        }
    }
}
