---
layout: mypost
title: MySQL之全文索引
categories: [数据库]
---

当数据量大的时候，使用 like 进行关键词查找是很慢的，这时候就需要建立全文索引了。mysql5.6 之前，只有 myisam 支持全文索引。到了 mysql5.6，innodb 开始支持全文索引

## 创建索引

```sql
CREATE TABLE `test` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `text_info` varchar(1000) NOT NULL,
  PRIMARY KEY (`id`)
);
```

创建全文索引

```sql
ALTER TABLE `test` ADD FULLTEXT INDEX `idx_text_info` (`text_info`);
```

插入测试数据

```sql
INSERT INTO `test` ( text_info ) VALUES( '一二三四五六七八九十' );
INSERT INTO `test` ( text_info ) VALUES( '一二三四五,六七八九十' );
INSERT INTO `test` ( text_info ) VALUES( '一二三四五|六七八九十' );
```

## 使用索引

全文索引查找的语法如下

```sql
MATCH(content) AGAINST ('keyword')
MATCH(content) AGAINST ('keyword' IN NATURAL LANGUAGE MODE))
MATCH(content) AGAINST ('keyword' IN BOOLEAN MODE))
```

1. 自然语言查找

   默认就是这种模式，可以省略不写，当然也可以主动声明使用`IN NATURAL LANGUAGE MODE`。
   但是这种模式一般不是我们需要的，因为他主要针对的是拉丁文。他会忽略停词，如 and、or、to 等，所以搜索这些不会获得任何结果。
   注意：如果某个词在数据集中频繁出现的几率超过了 50%，也会被认为是停词。
   这种模式下进行的是全词匹配，而且不会出现，如搜索 box 时，就不会将 boxing 作为检索目标。

2. 布尔查找

   按照给定操作符进行查找 ，不会出现自然语言查找模式下的玄学查找结果

   常用的操作符可以在`ft_boolean_syntax`中查看，下面是几种常见的查询操作符

   `无操作符`：该单词可有可无，但含有该单词的行等级较高

   `空格`：可选的，包含该词的顺序较高

   `"text"`：全词匹配查找

   `text*`：通配符查找，`*`只能放在后面

   `+text`：必须包含，`+`只能放在词前面

   `-text`：必须不包含，不能单独使用，如`+aaaa-cccc`

   `>text`：如果含有该词，提高词的相关性

   `<text`：如果含有该词，降低词的相关性

   `()`：条件组，如`aaaa+(bbbb cccc)`表示必须包含 bbbb 或 cccc

## 分词

注意：所有的查找都是以词为基础的

如`一二三四五,六七八九十`会被索引为两个词，所以如下的语句是查不到任何信息的

```sql
SELECT * FROM test WHERE MATCH(text_info) AGAINST ('六七八九*' IN BOOLEAN MODE);
```

默认条件下都是以空格和常用标点符号作为划分词的依据的，但是并不是所有的词都会被索引，系统是有一些默认配置的，如下语句可用于查看默认配置

```sql
show variables like '%ft%';
```

> The minimum and maximum word length full-text parameters apply to FULLTEXT indexes created using the built-in FULLTEXT parser and MeCab parser plugin. innodb_ft_min_token_size and innodb_ft_max_token_size are used for InnoDB search indexes. ft_min_word_len and ft_max_word_len are used for MyISAM search indexes.

> ft_min_word_len 用于 MyISAM 引擎，innodb_ft_min_token_size 用户 InnoDB 引擎

ft_min_word_len 和 innodb_ft_min_token_size 表示小于该长度的词不建立索引，很明显该值调大可以减少索引空间的占用，但是查找效果就不好了，建议根据使用的语言进行设置，一般英文一个词的长度都是 3，中文为 2。

ft_max_word_len，innodb_ft_max_token_size 表示大于该长度的词不作为查找条件

## ngram 分词插件

如果使用系统分词符号进行分词就需要在存放数据的时候有意识地对文本进行分隔，在 mysql5.7.6 后有内置了 ngram 分词插件，即可避免该操作

使用 ngram 插件只需要在建立索引时声明使用 ngram 即可

```sql
ALTER TABLE `test` ADD FULLTEXT INDEX `idx_text_info` (`text_info`) WITH PARSER ngram;
```

通过下面的命令可以查看 ngram 的配置，需要注意的是，如果使用了 ngram，那么`ft_min_word_len`或者`innodb_ft_min_token_size`的配置就无效了

```sql
show variables like '%ngram%';
```

ngram 是以长度为基础进行分词的，当 ngram_token_size 为 2 的时候`一二三四五六`可分为下面几个词`一二`、`二三`、`三四`.....对于下面的查询，很好理解命中了`二三`

```sql
SELECT * FROM test WHERE MATCH(text_info) AGAINST ('二三' IN BOOLEAN MODE);
```

但是对于下面的的查询同样也会命中，这是由于查询的关键词也会以`ngram_token_size`进行分词

```sql
SELECT * FROM test WHERE MATCH(text_info) AGAINST ('二三四');
SELECT * FROM test WHERE MATCH(text_info) AGAINST ('二三四' IN BOOLEAN MODE);
```

## 重建索引

当调整了`ft_min_word_len`或`innodb_ft_min_token_size`后，为了让全文索引使用最新的配置，需要重建索引

方式一：删除索引，在建立索引

方式二：`repair table 表名.字段名 quick;`

为了快速找出需要所有需要重建索引的字段可以使用如下如语句

```sql
SELECT DISTINCT
  CONCAT( 'repair table ', table_schema, '.', table_name, ' quick;' )
FROM
  information_schema.`STATISTICS`
WHERE
  index_type = 'fulltext';
```

## 参考

[https://dev.mysql.com/doc/refman/5.7/en/innodb-parameters.html](https://dev.mysql.com/doc/refman/5.7/en/innodb-parameters.html)

[https://dev.mysql.com/doc/refman/5.7/en/fulltext-fine-tuning.html](https://dev.mysql.com/doc/refman/5.7/en/fulltext-fine-tuning.html)

[https://blog.csdn.net/NTSDB/article/details/81124332](https://blog.csdn.net/NTSDB/article/details/81124332)
