package auth

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

func GenerateHash(password string) string {
	salt := make([]byte, 16)
	rand.Read(salt)

	var time uint32 = 4
	var memory uint32 = 128 * 1024
	var threads uint8 = 4

	hash := argon2.IDKey([]byte(password), salt, time, memory, threads, 32)

	encodedSalt := base64.RawStdEncoding.EncodeToString(salt)
	encodedHash := base64.RawStdEncoding.EncodeToString(hash)

	fullString := fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s", memory, time, threads, encodedSalt, encodedHash)

	return fullString
}

func ValidateHash(hashString string, password string) error {
	parts := strings.Split(hashString, "$")
	if len(parts) != 6 {
		return fmt.Errorf("invalid hash format")
	}

	if parts[1] != "argon2id" || parts[2] != "v=19" {
		return fmt.Errorf("invalid hash format")
	}

	var time, memory uint32
	var threads uint8
	_, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &time, &threads)
	if err != nil {
		return fmt.Errorf("failed to scan hash parameters: %v", err)
	}

	encodedSalt := parts[4]
	encodedHash := parts[5]
	salt, err := base64.RawStdEncoding.DecodeString(encodedSalt)
	if err != nil {
		return fmt.Errorf("failed to decode salt: %v", err)
	}

	originalHash, err := base64.RawStdEncoding.DecodeString(encodedHash)
	if err != nil {
		return fmt.Errorf("failed to decode hash: %v", err)
	}

	calculatedHash := argon2.IDKey([]byte(password), salt, time, memory, threads, 32)

	if !subtleCompare(originalHash, calculatedHash) {
		return fmt.Errorf("hashes do not match")
	}

	return nil
}

func subtleCompare(a, b []byte) bool {
	if len(a) != len(b) {
		return false
	}

	diff := byte(0)
	for i := range len(a) {
		diff |= a[i] ^ b[i]
	}

	if diff != 0 {
		return false
	}

	return true
}
