import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    setTimeout(async () => {
      await onDelete(id);
      setIsDeleting(false);
    }, 1000);
  };

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.description}>{expense.description}</Text>
        <Text style={styles.value}>R$ {expense.value}</Text>
        <Text style={styles.date}>
          {expense.date.toDate().toLocaleDateString("pt-BR")}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(expense)}
          style={styles.editBtn}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(expense.id)}
          style={styles.deleteBtn}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Excluir</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fefefe",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  content: {
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontWeight: "bold",
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  date: {
    fontSize: 14,
    color: "#777",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editBtn: {
    marginRight: 10,
    backgroundColor: "#007bff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
});
