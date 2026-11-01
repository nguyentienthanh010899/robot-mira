/** Check narration, preserving quoted examples and code verbatim. No global pronoun replacement. */
function narration(text: string) {
  return text.replace(/```[\s\S]*?```|`[^`]*`|“[^”]*”|"[^"\n]*"|‘[^’]*’/g, '');
}
export function roleIssues(text: string): string[] {
  const prose = narration(text);
  const issues: string[] = [];
  if (!/^Bẩm đại ca,\s*\S/u.test(text.trim())) issues.push('Mở đầu đúng một lần bằng Bẩm đại ca,');
  if ((prose.match(/bẩm đại ca/giu) || []).length > 1) issues.push('Không lặp lời mở đầu');
  const withoutTerms = prose.replace(/(?<![\p{L}])(?:bạn bè|bạn đọc|bạn học|bạn thân|bạn đời|bạn đồng hành|cậu bé|cậu ruột|của mình|chính mình|một mình|chúng mình)(?![\p{L}])/giu, '');
  if (/(?:^|[^\p{L}])(?:cậu|tôi|mình|bạn|anh|em|ngươi|chúa công)(?![\p{L}])/iu.test(withoutTerms)) issues.push('AI chỉ xưng đệ; chỉ gọi người dùng là đại ca');
  if (/(?:thấy|nghe|khi|nếu|sao|vì|của|cho|giúp|khuyên)\s+đệ\s+(?:buồn|mệt|lo|ngủ|nghỉ|nên|cần|hãy)|đệ\s+(?:hãy|có muốn|muốn kể)/iu.test(prose)) issues.push('Không gọi người dùng là đệ');
  return issues;
}
