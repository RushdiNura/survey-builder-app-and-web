import React, { useState } from "react";
import { View, Text, Pressable, Image, StyleSheet, Platform, ActionSheetIOS, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { X, Plus, ImagePlus, Paperclip, ChevronDown } from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";
import { QUESTION_TYPES } from "../theme/theme";
import Input from "./Input";
import Card from "./Card";
import { uploadFile } from "../api/surveyService";
import { useToast } from "../context/ToastContext";

const NEEDS_OPTIONS = ["multiple-choice", "checkboxes", "dropdown"];

export default function QuestionBuilderCard({ question, index, onChange, onRemove }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);

  function update(field, value) {
    onChange(index, { ...question, [field]: value });
  }
  function updateOption(i, value) {
    const options = [...question.options];
    options[i] = value;
    update("options", options);
  }
  function addOption() {
    update("options", [...(question.options || []), ""]);
  }
  function removeOption(i) {
    update("options", question.options.filter((_, oi) => oi !== i));
  }

  function openTypePicker() {
    const labels = QUESTION_TYPES.map((t) => t.label);
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...labels, "Cancel"], cancelButtonIndex: labels.length },
        (i) => {
          if (i < labels.length) update("type", QUESTION_TYPES[i].value);
        }
      );
    } else {
      Alert.alert(
        "Question type",
        undefined,
        QUESTION_TYPES.map((t) => ({ text: t.label, onPress: () => update("type", t.value) })).concat([
          { text: "Cancel", style: "cancel" },
        ])
      );
    }
  }

  async function handlePickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showToast("Photo library access is needed to attach an image", "error");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const { url } = await uploadFile({ uri: asset.uri, name: asset.fileName, mimeType: asset.mimeType });
      update("imageUrl", url);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      showToast("Upload failed — please try again", "error");
    } finally {
      setUploading(false);
    }
  }

  const typeLabel = QUESTION_TYPES.find((t) => t.value === question.type)?.label || question.type;

  return (
    <Card style={styles.card}>
      <View style={[styles.indexBadge, { backgroundColor: theme.colors.primaryTint }]}>
        <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semibold, fontSize: 11 }}>
          Q{String(index + 1).padStart(2, "0")}
        </Text>
      </View>

      <Pressable onPress={() => onRemove(index)} hitSlop={8} style={styles.removeButton}>
        <X size={16} color={theme.colors.danger} />
      </Pressable>

      <Input
        placeholder="Question text"
        value={question.question}
        onChangeText={(t) => update("question", t)}
        containerStyle={{ marginTop: 4 }}
      />

      <Pressable
        onPress={openTypePicker}
        style={[styles.typeSelector, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt }]}
      >
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium, fontSize: 14 }}>
          {typeLabel}
        </Text>
        <ChevronDown size={16} color={theme.colors.textFaint} />
      </Pressable>

      <Pressable
        onPress={() => update("required", !question.required)}
        style={styles.requiredRow}
        hitSlop={6}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: question.required ? theme.colors.primary : theme.colors.borderStrong,
              backgroundColor: question.required ? theme.colors.primary : "transparent",
            },
          ]}
        />
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, fontSize: 13.5 }}>
          Required
        </Text>
      </Pressable>

      {NEEDS_OPTIONS.includes(question.type) && (
        <View style={[styles.optionsBlock, { borderLeftColor: theme.colors.border }]}>
          {(question.options || []).map((opt, i) => (
            <View key={i} style={styles.optionRow}>
              <Input
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChangeText={(t) => updateOption(i, t)}
                containerStyle={{ flex: 1 }}
              />
              <Pressable onPress={() => removeOption(i)} hitSlop={8} style={styles.optionRemove}>
                <X size={14} color={theme.colors.textFaint} />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={addOption} style={styles.addOptionButton}>
            <Plus size={13} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium, fontSize: 13 }}>
              Add option
            </Text>
          </Pressable>
        </View>
      )}

      {question.type === "image" && (
        <View style={[styles.optionsBlock, { borderLeftColor: theme.colors.border }]}>
          {question.imageUrl && <Image source={{ uri: question.imageUrl }} style={styles.imagePreview} />}
          <Pressable onPress={handlePickImage} style={styles.uploadButton} disabled={uploading}>
            <ImagePlus size={13} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium, fontSize: 13 }}>
              {uploading ? "Uploading…" : question.imageUrl ? "Replace image" : "Upload an image"}
            </Text>
          </Pressable>
        </View>
      )}

      {question.type === "file-upload" && (
        <View style={[styles.optionsBlock, { borderLeftColor: theme.colors.border, flexDirection: "row", gap: 6, alignItems: "center" }]}>
          <Paperclip size={13} color={theme.colors.textFaint} />
          <Text style={{ color: theme.colors.textFaint, fontFamily: theme.typography.fontFamily.regular, fontSize: 12, flex: 1 }}>
            Respondents attach one file (image, PDF, or doc, up to 10MB).
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14, paddingTop: 40 },
  indexBadge: { position: "absolute", top: 14, left: 14, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  removeButton: { position: "absolute", top: 12, right: 12, padding: 6 },
  typeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 10,
  },
  requiredRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5 },
  optionsBlock: { marginTop: 14, paddingLeft: 12, borderLeftWidth: 2, gap: 8 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  optionRemove: { padding: 6 },
  addOptionButton: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingVertical: 4 },
  uploadButton: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" },
  imagePreview: { width: 120, height: 90, borderRadius: 10 },
});
