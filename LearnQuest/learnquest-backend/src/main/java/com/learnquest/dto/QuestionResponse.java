package com.learnquest.dto;

import com.learnquest.model.Question;

public class QuestionResponse {
    private Long id;
    private String topic;
    private String difficulty;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    public static QuestionResponse fromEntity(Question q) {
        QuestionResponse r = new QuestionResponse();
        r.id = q.getId();
        r.topic = q.getTopic();
        r.difficulty = q.getDifficulty();
        r.questionText = q.getQuestionText();
        r.optionA = q.getOptionA();
        r.optionB = q.getOptionB();
        r.optionC = q.getOptionC();
        r.optionD = q.getOptionD();
        return r;
    }

    public Long getId() { return id; }
    public String getTopic() { return topic; }
    public String getDifficulty() { return difficulty; }
    public String getQuestionText() { return questionText; }
    public String getOptionA() { return optionA; }
    public String getOptionB() { return optionB; }
    public String getOptionC() { return optionC; }
    public String getOptionD() { return optionD; }
}