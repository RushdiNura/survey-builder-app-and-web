import React, { useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { Upload, CheckCircle2, Paperclip } from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";
import Input from "./Input";
import { uploadFile } from "../api/surveyService";
import { useToast } from "../context/ToastContext";

export default function QuestionRenderer({ question, value, onChange }) {
  const { theme } = useTheme();
  const id = question._id;

  switch (question.type) {
    case "short-answer":
      return <Input value={value || ""} onChangeText={(t) => onChange(id, t)} placeholder="Your answer" />;

    case "long-answer":
      return (
        <Input
          value={value || ""}
          onChangeText={(t) => onChange(id, t)}
          placeholder="Your answer"
          multiline
          numberOfLines={4}
          style={{ minHeight: 90, textAlignVertical: "top" }}
        />
      );

    case "multiple-choice":
      return (
        <OptionList
          options={question.options}
          selected={(opt) => value === opt}
          onSelect={(opt) => onChange(id, opt)}
        />
      );

    case "checkboxes": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <OptionList
          options={question.options}
          multi
          selected={(opt) => selected.includes(opt)}
          onSelect={(opt) => {
            const next = selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt];
            onChange(id, next);
          }}
        />
      );
    }

    case "dropdown":
      return (
        <OptionList
          options={question.options}
          selected={(opt) => value === opt}
          onSelect={(opt) => onChange(id, opt)}
        />
      );

    case "rating":
      return (
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((n) => {
            const active = Number(value) === n;
            return (
              <Pressable
                key={n}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  onChange(id, n);
                }}
                style={[
                  styles.ratingCell,
                  {
                    backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? "#FFFFFF" : theme.colors.text,
                    fontFamily: theme.typography.fontFamily.semibold,
                    fontSize: 15,
                  }}
                >
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>
      );

    case "yes-no":
      return (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <OptionList
            options={["Yes", "No"]}
            selected={(opt) => value === opt}
            onSelect={(opt) => onChange(id, opt)}
            horizontal
          />
        </View>
      );

    case "image":
      return (
        <View style={{ gap: 10 }}>
          {question.imageUrl && <Image source={{ uri: question.imageUrl }} style={styles.questionImage} resizeMode="cover" />}
          <Input value={value || ""} onChangeText={(t) => onChange(id, t)} placeholder="Your answer" />
        </View>
      );

    case "file-upload":
      return <FileUploadAnswer value={value} onChange={(v) => onChange(id, v)} />;

    default:
      return (
        <Text style={{ color: theme.colors.textFaint, fontFamily: theme.typography.fontFamily.regular, fontSize: 13 }}>
          Unsupported question type: {question.type}
        </Text>
      );
  }
}

function OptionList({ options, selected, onSelect, horizontal = false }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: 8, flexDirection: horizontal ? "row" : "column" }}>
      {options.map((opt) => {
        const isSelected = selected(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onSelect(opt);
            }}
            style={[
              styles.optionTile,
              horizontal && { flex: 1, justifyContent: "center" },
              {
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                backgroundColor: isSelected ? theme.colors.primaryTint : theme.colors.surface,
              },
            ]}
          >
            <View
              style={[
                styles.radioDot,
                { borderColor: isSelected ? theme.colors.primary : theme.colors.borderStrong },
              ]}
            >
              {isSelected && <View style={[styles.radioDotFill, { backgroundColor: theme.colors.primary }]} />}
            </View>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular, fontSize: 14 }}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FileUploadAnswer({ value, onChange }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);

  async function handlePick() {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const uploaded = await uploadFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
      onChange({ url: uploaded.url, name: uploaded.originalName });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      showToast("Upload failed — please try again", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={{ gap: 8 }}>
      <Pressable
        onPress={handlePick}
        disabled={uploading}
        style={[styles.filePickButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
      >
        {uploading ? <ActivityIndicator size="small" color={theme.colors.primary} /> : <Upload size={15} color={theme.colors.primary} />}
        <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium, fontSize: 13.5 }}>
          {uploading ? "Uploading…" : "Choose file"}
        </Text>
      </Pressable>
      {value?.name && (
        <View style={styles.fileConfirm}>
          <CheckCircle2 size={14} color={theme.colors.positive} />
          <Text style={{ color: theme.colors.positive, fontFamily: theme.typography.fontFamily.medium, fontSize: 13 }}>
            {value.name}
          </Text>
        </View>
      )}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Paperclip size={11} color={theme.colors.textFaint} />
        <Text style={{ color: theme.colors.textFaint, fontFamily: theme.typography.fontFamily.regular, fontSize: 11.5 }}>
          Image, PDF, or doc — up to 10MB
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ratingRow: { flexDirection: "row", gap: 8 },
  ratingCell: { width: 46, height: 46, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  optionTile: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
  radioDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  radioDotFill: { width: 9, height: 9, borderRadius: 5 },
  questionImage: { width: "100%", height: 200, borderRadius: 12 },
  filePickButton: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, alignSelf: "flex-start" },
  fileConfirm: { flexDirection: "row", alignItems: "center", gap: 6 },
});
