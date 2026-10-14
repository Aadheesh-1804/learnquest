package com.learnquest.dto;

public class AnswerCheckResponse {
    private boolean correct;
    private String correctOption;

    public AnswerCheckResponse() {}

    public AnswerCheckResponse(boolean correct, String correctOption) {
        this.correct = correct;
        this.correctOption = correctOption;
    }

    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }

    public String getCorrectOption() { return correctOption; }
    public void setCorrectOption(String correctOption) { this.correctOption = correctOption; }
}